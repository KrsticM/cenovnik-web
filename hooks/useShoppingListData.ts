import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SharedList, SharedListItem } from "@/lib/services/sharedList";

export type Item = SharedListItem;
export type ShoppingList = SharedList;

interface UseShoppingListDataReturn {
  list: ShoppingList | null;
  loading: boolean;
  error: string;
  // The link stopped working (list deleted or sharing turned off), possibly while open.
  notFound: boolean;
  refresh: (background?: boolean) => Promise<void>;
  // Applies a confirmed tick locally without waiting for the realtime reload.
  setItemChecked: (productId: string, checkedAt: string | null) => void;
}

// `initial` is the server-rendered list; without it (server error) the hook loads on mount.
export function useShoppingListData(token: string, initial: ShoppingList | null): UseShoppingListDataReturn {
  const [list, setList] = useState<ShoppingList | null>(initial);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(initial === null);

  const load = useCallback(
    async (background = false) => {
      if (!background) setLoading(true);
      try {
        const response = await fetch(`/api/lista/${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error(data.error || "Lista trenutno nije dostupna.");
        }
        setList(data);
        setError("");
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : "Lista trenutno nije dostupna."
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Load on mount only when the server couldn't render the list
  useEffect(() => {
    if (initial === null) void load();
  }, [initial, load]);

  // Setup real-time subscription
  useEffect(() => {
    if (!list?.id) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`shared-list:${list.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `shopping_list_id=eq.${list.id}`,
        },
        () => void load(true)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shopping_lists",
          filter: `id=eq.${list.id}`,
        },
        () => void load(true)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [list?.id, load]);

  const setItemChecked = useCallback((productId: string, checkedAt: string | null) => {
    setList((current) =>
      current && {
        ...current,
        items: current.items.map((item) => (item.productId === productId ? { ...item, checkedAt } : item)),
      }
    );
  }, []);

  return { list, loading, error, notFound, refresh: load, setItemChecked };
}
