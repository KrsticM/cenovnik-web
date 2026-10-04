import { useEffect, useMemo, useState } from "react";
import { useFavouriteStores } from "@/contexts/ShoppingListContext";
import { fetchProduct, fetchProductOffers, type ProductOffer } from "@/lib/services/products";
import type { Store } from "@/lib/services/stores";
import { isUuid } from "@/lib/uuid";
import type { Product } from "@/types/product";
import { groupOffers, type OfferGroup } from "../components/detail/groupOffers";

export type ProductOffersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "no-stores" }
  | { status: "stores-failed" }
  | { status: "ready"; groups: OfferGroup[]; unavailable: Store[]; cheapestPrice: number | null };

type DetailData = {
  key: string;
  product: Product | null;
  offers: ProductOffer[];
  stores: Map<string, Store>;
  error: string | null;
};

const EMPTY: DetailData = { key: "", product: null, offers: [], stores: new Map(), error: null };
const NOT_FOUND = "Proizvod nije pronađen.";
const UNAVAILABLE = "Detalji proizvoda trenutno nisu dostupni.";
const NO_OFFERS = { offers: {} as Record<string, ProductOffer[]>, stores: new Map<string, Store>() };

export function useProductDetail(productId: string | null, known: Product | null) {
  const { storeIds, ready: storesReady, failed: storesFailed } = useFavouriteStores();
  const storeKey = storeIds.join(",");
  const validId = productId !== null && isUuid(productId);
  const requestKey = productId ? `${productId}|${storeKey}` : "";
  const [data, setData] = useState<DetailData>(EMPTY);

  useEffect(() => {
    if (!productId || !validId || !storesReady) return;
    let cancelled = false;
    const scopedStoreIds = storeKey ? storeKey.split(",") : [];

    (async () => {
      try {
        const [product, priced] = await Promise.all([
          known?.id === productId ? known : fetchProduct(productId),
          scopedStoreIds.length > 0 ? fetchProductOffers([productId], scopedStoreIds) : NO_OFFERS,
        ]);
        if (cancelled) return;
        setData({
          key: requestKey,
          product,
          offers: priced.offers[productId] ?? [],
          stores: priced.stores,
          error: product ? null : NOT_FOUND,
        });
      } catch (err) {
        console.error("[useProductDetail] Failed to load product:", err);
        if (!cancelled) setData({ ...EMPTY, key: requestKey, error: UNAVAILABLE });
      }
    })();

    return () => {
      cancelled = true;
    };
    // `known` only seeds the request; a new object for the same product must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, validId, storeKey, storesReady, requestKey]);

  const product = known?.id === productId ? known : data.key === requestKey ? data.product : null;

  const offers = useMemo<ProductOffersState>(() => {
    if (productId !== null && !validId) return { status: "error", message: NOT_FOUND };
    if (!storesReady || data.key !== requestKey) return { status: "loading" };
    if (data.error) return { status: "error", message: data.error };
    if (storesFailed) return { status: "stores-failed" };
    if (storeKey === "") return { status: "no-stores" };

    const offered = new Set(data.offers.map((offer) => offer.storeId));
    const groups = groupOffers(data.offers);
    return {
      status: "ready",
      groups,
      unavailable: [...data.stores.values()].filter((store) => !offered.has(store.id)),
      cheapestPrice: groups[0]?.price ?? null,
    };
  }, [productId, validId, storesReady, storesFailed, storeKey, requestKey, data]);

  return { product, offers, favouriteCount: storeIds.length };
}
