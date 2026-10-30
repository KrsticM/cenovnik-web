import { useEffect, useMemo, useState } from "react";
import { fetchProductOffers, ProductOffer } from "@/lib/services/products";
import type { Store } from "@/lib/services/stores";
import { ShoppingListItem } from "@/types/shoppingList";
import { compareStores } from "./compareStores";

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

  // Offers are loaded for the whole list so a tick doesn't refetch.
  const comparison = useMemo(() => compareStores(items, offers, stores), [items, offers, stores]);

  return { ...comparison, loading };
}
