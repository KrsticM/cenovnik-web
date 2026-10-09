import { useEffect, useRef, useState } from "react";
import { browseProducts } from "@/lib/services/products";
import { formatPrice } from "@/lib/formatPrice";
import { isAborted } from "@/lib/services/serviceError";
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from "../config";
import type { SearchSuggestion } from "../components/SearchField";

const SUGGESTION_LIMIT = 6;

// storeIds: null means "all markets".
export function useSearchSuggestions(query: string, storeIds: string[] | null) {
  const term = query.trim().toLowerCase();
  const scopeKey = storeIds === null ? "*" : storeIds.join(",");
  const [shown, setShown] = useState<{ scope: string; items: SearchSuggestion[] }>({ scope: scopeKey, items: [] });
  const cacheRef = useRef(new Map<string, SearchSuggestion[]>());

  useEffect(() => {
    if (term.length < SEARCH_MIN_LENGTH) return;
    const key = `${scopeKey}|${term}`;
    const cached = cacheRef.current.get(key);
    // The next keystroke aborts this request, so only the latest term can fill the list.
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (cached) {
        setShown({ scope: scopeKey, items: cached });
        return;
      }
      try {
        // Same ranking and market scope as the results grid; only products priced in scope.
        const { items: found } = await browseProducts(
          { query: term, storeIds },
          { sort: "relevance", seed: "", limit: SUGGESTION_LIMIT, signal: controller.signal }
        );
        const items = found.map(({ product, price }) => ({
          id: product.id,
          name: product.productName,
          hint: formatPrice(price),
        }));
        cacheRef.current.set(key, items);
        if (!controller.signal.aborted) setShown({ scope: scopeKey, items });
      } catch (err) {
        if (!controller.signal.aborted && !isAborted(err)) {
          console.error("[useSearchSuggestions] Failed to load suggestions:", err);
        }
      }
    }, cached ? 0 : SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // scopeKey stands in for storeIds, whose array identity isn't stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, scopeKey]);

  // Keep the previous list visible while the next one loads, as the design does.
  return term.length >= SEARCH_MIN_LENGTH && shown.scope === scopeKey ? shown.items : [];
}
