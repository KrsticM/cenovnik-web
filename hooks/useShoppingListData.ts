import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export type Item = {
  productId: string;
  productName: string;
  primaryBarcode: string;
  quantity: number;
};

export type ShoppingList = {
  id: string;
  name: string;
  items: Item[];
};

export type RealtimeConfig = {
  url: string;
  anonKey: string;
};

interface UseShoppingListDataReturn {
  list: ShoppingList | null;
  loading: boolean;
  error: string;
  refresh: (background?: boolean) => Promise<void>;
}

export function useShoppingListData(token: string): UseShoppingListDataReturn {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [realtimeConfig, setRealtimeConfig] = useState<RealtimeConfig | null>(null);

  const load = useCallback(
    async (background = false) => {
      if (!background) setLoading(true);
      try {
        const response = await fetch(`/api/lista/${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Lista trenutno nije dostupna.");
        }
        setList(data);
        setRealtimeConfig(data.realtime);
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

  // Load list on mount
  useEffect(() => {
    void load();
  }, [load]);

  // Setup real-time subscription
  useEffect(() => {
    if (!list?.id || !realtimeConfig) return;

    const supabase = createClient(realtimeConfig.url, realtimeConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

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
  }, [list?.id, realtimeConfig, load]);

  return { list, loading, error, refresh: load };
}
