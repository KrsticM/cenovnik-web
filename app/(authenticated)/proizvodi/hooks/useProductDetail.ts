import { useEffect, useMemo, useState } from "react";
import { fetchProduct, fetchProductOffers, type ProductOffer } from "@/lib/services/products";
import type { Store } from "@/lib/services/stores";
import type { Product } from "@/types/product";
import { groupOffers } from "../components/detail/groupOffers";

type DetailData = {
  key: string;
  product: Product | null;
  offers: ProductOffer[];
  stores: Map<string, Store>;
  error: string | null;
};

const EMPTY: DetailData = { key: "", product: null, offers: [], stores: new Map(), error: null };

// Product and its prices in the user's favourite stores, for the detail dialog.
// `known` is the card's product, so the dialog renders its header before anything loads.
export function useProductDetail(
  productId: string | null,
  known: Product | null,
  storeIds: string[],
  storesReady: boolean
) {
  const storeKey = storeIds.join(",");
  const requestKey = productId ? `${productId}|${storeKey}` : "";
  const [data, setData] = useState<DetailData>(EMPTY);

  useEffect(() => {
    if (!productId || !storesReady) return;
    let cancelled = false;
    const scopedStoreIds = storeKey ? storeKey.split(",") : [];

    (async () => {
      try {
        const [product, priced] = await Promise.all([
          known?.id === productId ? known : fetchProduct(productId),
          // Favourites only: without favourite stores there is nothing to compare.
          scopedStoreIds.length > 0
            ? fetchProductOffers([productId], scopedStoreIds)
            : { offers: {} as Record<string, ProductOffer[]>, stores: new Map<string, Store>() },
        ]);
        if (cancelled) return;
        setData({
          key: requestKey,
          product,
          offers: priced.offers[productId] ?? [],
          stores: priced.stores,
          error: product ? null : "Proizvod nije pronađen.",
        });
      } catch (err) {
        console.error("[useProductDetail] Failed to load product:", err);
        if (!cancelled) {
          setData({ ...EMPTY, key: requestKey, error: "Detalji proizvoda trenutno nisu dostupni." });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // `known` only seeds the request; a new object for the same product must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, storeKey, storesReady, requestKey]);

  const loading = productId !== null && data.key !== requestKey;
  const product = known?.id === productId ? known : data.key === requestKey ? data.product : null;

  const { groups, unavailable } = useMemo(() => {
    const offered = new Set(data.offers.map((o) => o.storeId));
    return {
      groups: groupOffers(data.offers),
      unavailable: [...data.stores.values()].filter((store) => !offered.has(store.id)),
    };
  }, [data]);

  return {
    product,
    loading,
    error: loading ? null : data.error,
    groups: loading ? [] : groups,
    unavailable: loading ? [] : unavailable,
    favouriteCount: storeIds.length,
    cheapestPrice: loading ? null : (groups[0]?.price ?? null),
  };
}
