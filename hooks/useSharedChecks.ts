import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { createLocalStore } from "@/lib/localStore";
import type { SharedListItem } from "@/lib/services/sharedList";

export type CheckedItems = Record<string, number>;

type Pending = Record<string, number>;

type SendResult = { status: "saved"; checkedAt: string | null } | { status: "failed" } | { status: "gone" };
type ReplayOutcome = { failed: boolean; dropped: boolean };

const EMPTY: Pending = {};
const RETRY_MS = 10_000;
const NOT_FOUND = "P0002";

const pendingKey = (token: string) => `ecenovnik-list-pending:${token}`;
const legacyKey = (token: string) => `ecenovnik-list:${token}`;

const pendingStore = createLocalStore<Pending>({
  parse: (value) => (value && typeof value === "object" && !Array.isArray(value) ? (value as Pending) : null),
  empty: EMPTY,
});

function removeTap(key: string, productId: string, tappedAt: number) {
  const now = pendingStore.read(key);
  // A newer tap on the same item stays queued.
  if (now[productId] !== tappedAt) return;
  const rest = { ...now };
  delete rest[productId];
  pendingStore.write(key, Object.keys(rest).length > 0 ? rest : null);
}

export async function replayTaps(
  key: string,
  send: (productId: string, checked: boolean) => Promise<SendResult>,
  onSaved: (productId: string, checkedAt: string | null) => void
): Promise<ReplayOutcome> {
  let dropped = false;
  for (const [productId, tappedAt] of Object.entries(pendingStore.read(key))) {
    const result = await send(productId, tappedAt > 0);
    if (result.status === "failed") return { failed: true, dropped };
    removeTap(key, productId, tappedAt);
    if (result.status === "gone") dropped = true;
    else onSaved(productId, result.checkedAt);
  }
  return { failed: false, dropped };
}

async function sendTap(token: string, productId: string, checked: boolean): Promise<SendResult> {
  const { data, error } = await createClient().rpc("set_shared_item_checked", {
    p_token: token,
    p_product_id: productId,
    p_checked: checked,
  });
  if (!error) return { status: "saved", checkedAt: (data as string | null) ?? null };
  if (error.code === NOT_FOUND) return { status: "gone" };
  console.error("[useSharedChecks] Tick not saved:", error);
  return { status: "failed" };
}

interface UseSharedChecksOptions {
  token: string;
  items: SharedListItem[];
  online: boolean;
  onSaved: (productId: string, checkedAt: string | null) => void;
  onLinkLost: () => void;
}

export function useSharedChecks({ token, items, online, onSaved, onLinkLost }: UseSharedChecksOptions) {
  const key = pendingKey(token);
  const pending = useSyncExternalStore(pendingStore.subscribe, () => pendingStore.read(key), () => EMPTY);
  const [failedAt, setFailedAt] = useState<number | null>(null);

  const checkedItems = useMemo<CheckedItems>(() => {
    const checked: CheckedItems = {};
    for (const item of items) {
      if (item.checkedAt) checked[item.productId] = Date.parse(item.checkedAt);
    }
    for (const [productId, tappedAt] of Object.entries(pending)) {
      if (tappedAt > 0) checked[productId] = checked[productId] ?? tappedAt;
      else delete checked[productId];
    }
    return checked;
  }, [items, pending]);

  const flushing = useRef(false);
  const rerun = useRef(false);
  const flush = useCallback(async (): Promise<void> => {
    if (!navigator.onLine) return;
    if (flushing.current) {
      // A tap arrived mid-flush; send it once the current round finishes.
      rerun.current = true;
      return;
    }
    flushing.current = true;
    try {
      let failed = false;
      let dropped = false;
      do {
        rerun.current = false;
        const outcome = await replayTaps(key, (productId, checked) => sendTap(token, productId, checked), onSaved);
        failed = outcome.failed;
        dropped ||= outcome.dropped;
      } while (rerun.current && !failed);

      if (dropped) onLinkLost();
      setFailedAt(failed ? Date.now() : null);
    } finally {
      flushing.current = false;
    }
  }, [key, token, onSaved, onLinkLost]);

  // Old device-only ticks are dropped, not published to everyone.
  useEffect(() => {
    try {
      window.localStorage.removeItem(legacyKey(token));
    } catch {
    }
  }, [token]);

  useEffect(() => {
    if (online) void flush();
  }, [online, flush]);

  // Each failed attempt sets a new failedAt, which schedules the next retry.
  useEffect(() => {
    if (failedAt === null || !online) return;
    const timer = setTimeout(() => void flush(), RETRY_MS);
    return () => clearTimeout(timer);
  }, [failedAt, online, flush]);

  const toggleItem = useCallback(
    (productId: string) => {
      const next = { ...pendingStore.read(key), [productId]: checkedItems[productId] ? 0 : Date.now() };
      pendingStore.write(key, next);
      void flush();
    },
    [key, checkedItems, flush]
  );

  const unsaved = failedAt !== null && Object.keys(pending).length > 0;

  return { checkedItems, toggleItem, unsaved };
}
