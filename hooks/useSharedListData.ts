import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SharedList } from "@/lib/services/sharedList";
import { fetchSharedListFromApi } from "@/lib/services/sharedListClient";

const RELOAD_DEBOUNCE_MS = 200;

interface UseSharedListDataReturn {
  list: SharedList | null;
  loading: boolean;
  notFound: boolean;
  refresh: (background?: boolean) => Promise<void>;
  setItemChecked: (productId: string, checkedAt: string | null) => void;
}

export function useSharedListData(token: string, initial: SharedList | null): UseSharedListDataReturn {
  const [list, setList] = useState<SharedList | null>(initial);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(initial === null);
  const seqRef = useRef(0);

  const fetchList = useCallback(async () => {
    const seq = ++seqRef.current;
    const result = await fetchSharedListFromApi(token);
    if (seq !== seqRef.current) return;

    if (result.status === "ok") setList(result.list);
    if (result.status === "not-found") setNotFound(true);
    setLoading(false);
  }, [token]);

  const load = useCallback(
    async (background = false) => {
      if (!background) setLoading(true);
      await fetchList();
    },
    [fetchList]
  );

  useEffect(() => {
    // setState happens after the await, which the rule can't see.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial === null) void fetchList();
  }, [initial, fetchList]);

  const listId = list?.id;
  const topic = list?.topic ?? null;
  useEffect(() => {
    if (!listId) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleReload = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void load(true), RELOAD_DEBOUNCE_MS);
    };

    const supabase = createClient();
    // No topic until shared_list_realtime.sql runs; until then listen on the table.
    const channel = topic
      ? supabase.channel(topic).on("broadcast", { event: "changed" }, scheduleReload).subscribe()
      : supabase
          .channel(`shared-list:${listId}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "shopping_list_items", filter: `shopping_list_id=eq.${listId}` },
            scheduleReload
          )
          .subscribe();

    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [listId, topic, load]);

  const setItemChecked = useCallback((productId: string, checkedAt: string | null) => {
    // Discard any reload already in flight; it read the list before this tick.
    seqRef.current += 1;
    setList(
      (current) =>
        current && {
          ...current,
          items: current.items.map((item) => (item.productId === productId ? { ...item, checkedAt } : item)),
        }
    );
  }, []);

  return { list, loading, notFound, refresh: load, setItemChecked };
}
