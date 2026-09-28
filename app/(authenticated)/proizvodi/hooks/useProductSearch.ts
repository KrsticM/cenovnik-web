import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const SEARCH_DEBOUNCE_MS = 400;

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

// Search input state: what's typed (`query`) vs. what's searched (`liveQuery`, debounced or
// committed on Enter / suggestion), kept in the URL as ?q= with back/forward support.
export function useProductSearch() {
  const initialQuery = useSearchParams().get("q") ?? "";
  const [query, setQueryState] = useState(initialQuery);
  const [liveQuery, setLiveQuery] = useState(initialQuery.trim());
  const [searching, setSearching] = useState(false);
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

  return {
    query,
    liveQuery,
    searching,
    setQuery,
    commit,
    clear: () => commit("", true),
  };
}
