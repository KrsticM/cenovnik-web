import { useEffect, useRef, useState } from "react";
import { fetchProductOffers, ProductOffer } from "@/lib/services/products";
import { Product } from "@/types/product";

type ScopedOffers = { scope: string; offers: Record<string, ProductOffer[]>; pending: number };

// storeIds: null means "all markets"; an array scopes offers to those stores.
export function useProductOffers(products: Product[], storeIds: string[] | null) {
  const scopeKey = storeIds === null ? "*" : storeIds.join(",");
  const [state, setState] = useState<ScopedOffers>({ scope: scopeKey, offers: {}, pending: 0 });
  const requestedRef = useRef<{ scope: string; ids: Set<string> }>({ scope: scopeKey, ids: new Set() });

  useEffect(() => {
    if (requestedRef.current.scope !== scopeKey) {
      requestedRef.current = { scope: scopeKey, ids: new Set() };
    }
    const requested = requestedRef.current.ids;
    const missing = products.map((p) => p.id).filter((id) => !requested.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => requested.add(id));

    const scope = scopeKey;
    const bump = (delta: number, fetched?: Record<string, ProductOffer[]>) =>
      setState((prev) => {
        const base = prev.scope === scope ? prev : { scope, offers: {}, pending: 0 };
        return {
          scope,
          offers: fetched ? { ...base.offers, ...fetched } : base.offers,
          pending: base.pending + delta,
        };
      });

    bump(1);
    fetchProductOffers(missing, storeIds && storeIds.length > 0 ? storeIds : undefined)
      .then((fetched) => {
        if (requestedRef.current.scope === scope) bump(-1, fetched);
      })
      .catch((err) => {
        missing.forEach((id) => requested.delete(id));
        if (requestedRef.current.scope === scope) bump(-1);
        console.error("[useProductOffers] Failed to fetch offers:", err?.code, err?.message ?? err);
      });
  }, [products, scopeKey, storeIds]);

  const current = state.scope === scopeKey;
  return {
    offers: current ? state.offers : {},
    isLoadingOffers: current ? state.pending > 0 : products.length > 0,
  };
}
