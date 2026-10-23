import { useEffect, useMemo, useState } from "react";
import { fetchProductOffers, ProductOffer } from "@/lib/services/products";
import type { Store } from "@/lib/services/stores";
import { ShoppingListItem } from "@/types/shoppingList";

export type StoreComparisonRow = {
  store: Store;
  total: number;
  available: ShoppingListItem[];
  missing: ShoppingListItem[];
};

export type ListComparison = {
  rows: StoreComparisonRow[];
  cheapestComplete: StoreComparisonRow | null;
  usedStoreCount: number;
  unavailableCount: number;
};

export function useListComparison(
  items: ShoppingListItem[],
  storeIds: string[],
  enabled: boolean
) {
  const productKey = items.map((i) => i.productId).sort().join(",");
  const storeKey = storeIds.join(",");
  const requestKey = `${productKey}|${storeKey}`;
  const [data, setData] = useState<{
    key: string;
    offers: Record<string, ProductOffer[]>;
    stores: Map<string, Store>;
  }>({ key: "", offers: {}, stores: new Map() });

  useEffect(() => {
    if (!enabled || !productKey) return;
    let cancelled = false;
    const scopedStoreIds = storeKey ? storeKey.split(",") : [];

    (async () => {
      try {
        const { offers, stores } = await fetchProductOffers(
          productKey.split(","),
          scopedStoreIds.length > 0 ? scopedStoreIds : undefined
        );
        if (!cancelled) setData({ key: requestKey, offers, stores });
      } catch (err) {
        console.error("[useListComparison] Failed to load comparison:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, productKey, storeKey, requestKey]);

  const { offers, stores } = data;
  const loading = enabled && productKey !== "" && data.key !== requestKey;

  // Offers are loaded for the whole list so a tick doesn't refetch; only what's left is compared.
  const comparison = useMemo<ListComparison>(() => {
    const active = items.filter((i) => !i.checkedAt);
    const priceAt = (item: ShoppingListItem, storeId: string) =>
      offers[item.productId]?.find((o) => o.storeId === storeId)?.price ?? null;

    const rows = (active.length > 0 ? [...stores.values()] : [])
      .map((store) => {
        const available = active.filter((i) => priceAt(i, store.id) !== null);
        const missing = active.filter((i) => priceAt(i, store.id) === null);
        const total = available.reduce((sum, i) => sum + priceAt(i, store.id)! * i.quantity, 0);
        return { store, total, available, missing };
      })
      .sort((a, b) => a.missing.length - b.missing.length || a.total - b.total);

    const usedStores = new Set(
      active.map((i) => offers[i.productId]?.[0]?.storeId).filter(Boolean)
    );

    return {
      rows,
      cheapestComplete: rows.find((r) => r.missing.length === 0) ?? null,
      usedStoreCount: usedStores.size,
      unavailableCount: active.filter((i) => !offers[i.productId]?.length).length,
    };
  }, [items, offers, stores]);

  return { ...comparison, loading };
}
