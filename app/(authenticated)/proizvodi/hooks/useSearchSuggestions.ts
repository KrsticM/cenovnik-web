import { useEffect, useRef, useState } from "react";
import { browseProducts } from "@/lib/services/products";
import { formatPrice } from "@/lib/formatPrice";
import type { SearchSuggestion } from "../components/SearchField";

const SUGGESTION_DEBOUNCE_MS = 150;
const SUGGESTION_LIMIT = 6;

// storeIds: null means "all markets".
export function useSearchSuggestions(query: string, storeIds: string[] | null) {
  const term = query.trim().toLowerCase();
  const scopeKey = storeIds === null ? "*" : storeIds.join(",");
  const [shown, setShown] = useState<{ scope: string; items: SearchSuggestion[] }>({ scope: scopeKey, items: [] });
  const cacheRef = useRef(new Map<string, SearchSuggestion[]>());

  useEffect(() => {
    if (!term) return;
    const key = `${scopeKey}|${term}`;
    const cached = cacheRef.current.get(key);
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cached) {
        setShown({ scope: scopeKey, items: cached });
        return;
      }
      try {
        // Same ranking and market scope as the results grid; only products priced in scope.
        const { items: found } = await browseProducts(
          { query: term, storeIds },
          { sort: "relevance", seed: "", limit: SUGGESTION_LIMIT }
        );
        const items = found.map(({ product, price }) => ({
          id: product.id,
          name: product.productName,
          hint: formatPrice(price),
        }));
        cacheRef.current.set(key, items);
        if (!cancelled) setShown({ scope: scopeKey, items });
      } catch (err) {
        console.error("[useSearchSuggestions] Failed to load suggestions:", err);
      }
    }, cached ? 0 : SUGGESTION_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // scopeKey stands in for storeIds, whose array identity isn't stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, scopeKey]);

  // Keep the previous list visible while the next one loads, as the design does.
  return term && shown.scope === scopeKey ? shown.items : [];
}
