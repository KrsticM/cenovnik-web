import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchProducts } from "@/lib/services/products";
import { Product } from "@/types/product";

const SEARCH_DEBOUNCE_MS = 400;

type SearchResults = {
  query: string;
  products: Product[];
  found: number;
  hasMore: boolean;
  page: number;
  error: string;
};

const EMPTY_RESULTS: SearchResults = { query: "", products: [], found: 0, hasMore: false, page: 1, error: "" };

function readUrlQuery(): string {
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

function syncUrl(value: string, push: boolean) {
  const url = new URL(window.location.href);
  const q = value.trim();
  if (q) url.searchParams.set("q", q);
  else url.searchParams.delete("q");
  if (url.toString() === window.location.href) return;
  if (push) window.history.pushState(null, "", url.toString());
  else window.history.replaceState(null, "", url.toString());
}

export function useProductSearch() {
  const initialQuery = useSearchParams().get("q") ?? "";
  const [query, setQueryState] = useState(initialQuery);
  const [liveQuery, setLiveQuery] = useState(initialQuery.trim());
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState<SearchResults>(EMPTY_RESULTS);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelDebounce = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const commit = useCallback((value: string, push = true) => {
    cancelDebounce();
    setQueryState(value);
    setLiveQuery(value.trim());
    setSearching(false);
    syncUrl(value, push);
  }, []);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setSearching(value.trim().length > 0);
    cancelDebounce();
    debounceRef.current = setTimeout(() => {
      setLiveQuery(value.trim());
      setSearching(false);
      syncUrl(value, false);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    const onPop = () => {
      cancelDebounce();
      const q = readUrlQuery();
      setQueryState(q);
      setLiveQuery(q.trim());
      setSearching(false);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      cancelDebounce();
    };
  }, []);

  useEffect(() => {
    if (!liveQuery) return;
    let cancelled = false;
    searchProducts(liveQuery, 1)
      .then((result) => {
        if (!cancelled) setData({ query: liveQuery, ...result, page: 1, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setData({
            ...EMPTY_RESULTS,
            query: liveQuery,
            error: err instanceof Error ? err.message : "Greška pri pretrazi.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [liveQuery]);

  const current = liveQuery !== "" && data.query === liveQuery ? data : EMPTY_RESULTS;

  const loadMore = useCallback(async () => {
    if (!current.query || loadingMore || !current.hasMore) return;
    const { query: forQuery, page } = current;
    setLoadingMore(true);
    try {
      const result = await searchProducts(forQuery, page + 1);
      setData((prev) => {
        if (prev.query !== forQuery) return prev;
        const ids = new Set(prev.products.map((p) => p.id));
        return {
          ...prev,
          products: [...prev.products, ...result.products.filter((p) => !ids.has(p.id))],
          hasMore: result.hasMore,
          page: page + 1,
        };
      });
    } catch (err) {
      setData((prev) =>
        prev.query === forQuery
          ? { ...prev, error: err instanceof Error ? err.message : "Greška pri učitavanju više proizvoda." }
          : prev
      );
    } finally {
      setLoadingMore(false);
    }
  }, [current, loadingMore]);

  return {
    query,
    liveQuery,
    isSearchMode: liveQuery.length > 0,
    searching,
    loadingResults: liveQuery !== "" && data.query !== liveQuery,
    loadingMore,
    results: current.products,
    found: current.found,
    hasMore: current.hasMore,
    error: current.error,
    setQuery,
    commit,
    clear: () => commit("", true),
    loadMore,
  };
}
