import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SharedListItem } from "@/lib/services/sharedList";

// productId → when it was ticked, so bought items can be shown newest first.
export type CheckedItems = Record<string, number>;

// Taps not yet confirmed by the server: productId → tap time (ticked) or 0 (unticked).
type Pending = Record<string, number>;

const EMPTY: Pending = {};
const pendingKey = (token: string) => `ecenovnik-list-pending:${token}`;
// Ticks used to live only on the device; they're dropped rather than published to everyone.
const legacyKey = (token: string) => `ecenovnik-list:${token}`;

// --- Pending taps in localStorage (survive reloads and offline periods) --------------------------

const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function readRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writePending(key: string, pending: Pending) {
  const raw = Object.keys(pending).length > 0 ? JSON.stringify(pending) : null;
  try {
    if (raw) window.localStorage.setItem(key, raw);
    else window.localStorage.removeItem(key);
  } catch {
    // Blocked or full storage: queue for this visit only.
    if (raw) memory.set(key, raw);
    else memory.delete(key);
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Parsed snapshot cached by raw value, so React sees the same object until storage changes.
let cache: { raw: string | null; value: Pending } = { raw: null, value: EMPTY };
function readPending(key: string): Pending {
  const raw = readRaw(key);
  if (raw !== cache.raw) {
    let value = EMPTY;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) value = parsed as Pending;
    } catch {
      // Corrupt entry: start over.
    }
    cache = { raw, value };
  }
  return cache.value;
}

// --- Hook --------------------------------------------------------------------------------------

// Shared "bought" ticks: saved on the item (supabase/shared_list_checks.sql) so everyone with the
// link sees the same state live. Taps show immediately, are queued while offline and replayed when
// the connection returns; the last tap wins. The server renders the confirmed state, pending taps
// apply right after hydration.
export function useSharedChecks(
  token: string,
  items: SharedListItem[],
  online: boolean,
  onConfirmed: (productId: string, checkedAt: string | null) => void
) {
  const key = pendingKey(token);
  const pending = useSyncExternalStore(subscribe, () => readPending(key), () => EMPTY);

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
    const supabase = createClient();
    try {
      let failed = false;
      do {
        rerun.current = false;
        for (const [productId, tappedAt] of Object.entries(readPending(key))) {
          const { data, error } = await supabase.rpc("set_shared_item_checked", {
            p_token: token,
            p_product_id: productId,
            p_checked: tappedAt > 0,
          });
          if (error) {
            // Keep the tap queued; the next tap or reconnect retries it.
            console.error("[useSharedChecks] Tick not saved:", error);
            failed = true;
            break;
          }
          const now = readPending(key);
          if (now[productId] === tappedAt) {
            const rest = { ...now };
            delete rest[productId];
            writePending(key, rest);
          }
          onConfirmed(productId, (data as string | null) ?? null);
        }
      } while (rerun.current && !failed);
    } finally {
      flushing.current = false;
    }
  }, [key, token, onConfirmed]);

  // Replay queued taps on load and whenever the connection comes back.
  useEffect(() => {
    try {
      window.localStorage.removeItem(legacyKey(token));
    } catch {
      // Storage unavailable: nothing to clean up.
    }
  }, [token]);
  useEffect(() => {
    if (online) void flush();
  }, [online, flush]);

  const toggleItem = useCallback(
    (productId: string) => {
      const next = { ...readPending(key), [productId]: checkedItems[productId] ? 0 : Date.now() };
      writePending(key, next);
      void flush();
    },
    [key, checkedItems, flush]
  );

  return { checkedItems, toggleItem, pendingCount: Object.keys(pending).length };
}
