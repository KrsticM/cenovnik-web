import { useEffect, useRef, useState } from "react";
import { fetchLowestPrices, fetchSuggestionCandidates } from "@/lib/services/products";
import { formatPrice } from "@/lib/formatPrice";
import type { SearchSuggestion } from "../components/SearchField";

const SUGGESTION_DEBOUNCE_MS = 150;
const SUGGESTION_LIMIT = 6;
// Over-fetch so products without a price in the current scope can be dropped and still fill the list.
const CANDIDATE_LIMIT = 12;

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
        const candidates = await fetchSuggestionCandidates(term, CANDIDATE_LIMIT);
        const scope = storeIds && storeIds.length > 0 ? storeIds : undefined;
        const prices = await fetchLowestPrices(candidates.map((p) => p.id), scope);
        const items = candidates
          .filter((p) => prices[p.id] !== undefined)
          .slice(0, SUGGESTION_LIMIT)
          .map((p) => ({ id: p.id, name: p.productName, hint: formatPrice(prices[p.id]) }));
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
