import { useState, useEffect, useRef, useMemo } from "react";
import { fetchLowestPrices } from "@/lib/services/products";
import { Product } from "@/types/product";

export function useProductPrices(products: Product[], userStoreIds: string[]) {
  const [lowestPrices, setLowestPrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const pricesFetchedRef = useRef(new Set<string>());

  // Create stable string representations to avoid unnecessary effect reruns
  // Only recalculate when products or userStoreIds actually change
  const productIdsKey = useMemo(
    () => products.map((p) => p.id).join(","),
    [products]
  );
  const storeIdsKey = useMemo(
    () => userStoreIds.join(","),
    [userStoreIds]
  );

  useEffect(() => {
    const fetchMissingPrices = async () => {
      const productIds = products.map((p) => p.id);
      const missing = productIds.filter(
        (id) => !pricesFetchedRef.current.has(id)
      );

      if (missing.length === 0) return;

      setIsLoadingPrices(true);

      try {
        const prices = await fetchLowestPrices(
          missing,
          userStoreIds.length > 0 ? userStoreIds : undefined
        );

        setLowestPrices((prev) => {
          const updated = { ...prev };
          Object.assign(updated, prices);
          return updated;
        });

        missing.forEach((id) => pricesFetchedRef.current.add(id));
      } catch (err) {
        console.error("[useProductPrices] Failed to fetch prices:", err);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    if (products.length > 0) {
      fetchMissingPrices();
    }
  }, [productIdsKey, storeIdsKey, products, userStoreIds]);

  const clearPrices = () => {
    pricesFetchedRef.current.clear();
    setLowestPrices({});
  };

  return {
    lowestPrices,
    isLoadingPrices,
    clearPrices,
  };
}
