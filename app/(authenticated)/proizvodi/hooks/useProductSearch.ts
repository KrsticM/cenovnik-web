import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from "../config";

const liveTerm = (value: string) => {
  const term = value.trim();
  return term.length >= SEARCH_MIN_LENGTH ? term : "";
};

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

// `query` is what's typed, `liveQuery` what's searched (debounced or committed); kept in the URL as ?q=.
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
    const term = liveTerm(value);
    setQueryState(value);
    setSearching(term.length > 0);
    cancelDebounce();
    debounceRef.current = setTimeout(() => {
      setLiveQuery(term);
      setSearching(false);
      syncUrl(term, false);
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
