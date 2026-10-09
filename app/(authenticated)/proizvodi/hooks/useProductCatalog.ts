import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  browseProducts,
  countProducts,
  type BrowseCursor,
  type BrowseFilters,
  type BrowseSort,
  type CatalogItem,
} from "@/lib/services/products";
import { isAborted, isTransient } from "@/lib/services/serviceError";
import { PRODUCTS_PER_PAGE, SEARCH_COUNT_DELAY_MS } from "../config";

type CatalogState = {
  key: string;
  items: CatalogItem[];
  cursor: BrowseCursor | null;
  count: number | null;
  error: string;
};

const EMPTY: CatalogState = { key: "", items: [], cursor: null, count: null, error: "" };

const LOAD_ERROR = "Proizvodi trenutno nisu dostupni.";
const LOAD_MORE_ERROR = "Nismo uspeli da učitamo još proizvoda.";
const RETRY_DELAY_MS = 600;

// Database messages stay in the console; the page only shows a short Serbian message.
function logError(context: string, err: unknown) {
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  console.error(`[catalog] ${context} failed`, code ?? "", message ?? err);
}

// Resolves after `ms`, or as soon as the request is replaced.
const pause = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (clearTimeout(timer), resolve()), { once: true });
  });

// One quiet retry for timeouts, expired sessions and network blips before showing an error.
async function withRetry<T>(run: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (signal?.aborted || !isTransient(err)) throw err;
    logError("first attempt", err);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return run();
  }
}

// Catalog queries run in the database (browse_products); `enabled` waits for the user's stores so the first request is scoped.
export function useProductCatalog(filters: BrowseFilters, sort: BrowseSort, enabled: boolean) {
  // Stable per session so "Preporučeno" keeps one shuffled order while scrolling.
  const [seed] = useState(() => Math.random().toString(36).slice(2));
  const [state, setState] = useState<CatalogState>(EMPTY);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Callers pass a fresh filters object every render; compare by value instead.
  const filtersKey = JSON.stringify(filters);
  const stableFilters = useMemo(() => JSON.parse(filtersKey) as BrowseFilters, [filtersKey]);
  const key = `${filtersKey}|${sort}|${attempt}`;
  const signalRef = useRef<AbortSignal | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    // Changing the search or a filter aborts the requests for the previous one, "load more" included.
    const controller = new AbortController();
    const { signal } = controller;
    signalRef.current = signal;

    // The count runs after the first page, so the two queries never compete for the database.
    withRetry(() => browseProducts(stableFilters, { sort, seed, limit: PRODUCTS_PER_PAGE, signal }), signal)
      .then(async (page) => {
        if (signal.aborted) return;
        setState({ key, items: page.items, cursor: page.nextCursor, count: null, error: "" });
        if (stableFilters.query) await pause(SEARCH_COUNT_DELAY_MS, signal);
        if (signal.aborted) return;
        const count = await countProducts(stableFilters, signal).catch(() => null);
        if (!signal.aborted) setState((prev) => (prev.key === key ? { ...prev, count } : prev));
      })
      .catch((err) => {
        if (signal.aborted || isAborted(err)) return;
        logError("browse", err);
        setState({ ...EMPTY, key, error: LOAD_ERROR });
      });

    return () => controller.abort();
  }, [key, stableFilters, sort, seed, enabled]);

  const current = state.key === key ? state : null;

  const loadMore = useCallback(async () => {
    if (!current?.cursor || loadingMore) return;
    const forKey = current.key;
    const after = current.cursor;
    const signal = signalRef.current;
    setLoadingMore(true);
    try {
      const page = await withRetry(
        () => browseProducts(stableFilters, { sort, seed, limit: PRODUCTS_PER_PAGE, after, signal }),
        signal
      );
      setState((prev) =>
        prev.key === forKey
          ? { ...prev, items: [...prev.items, ...page.items], cursor: page.nextCursor }
          : prev
      );
    } catch (err) {
      if (signal?.aborted || isAborted(err)) return;
      logError("load more", err);
      setState((prev) => (prev.key === forKey ? { ...prev, error: LOAD_MORE_ERROR } : prev));
    } finally {
      setLoadingMore(false);
    }
  }, [current, loadingMore, stableFilters, sort, seed]);

  return {
    items: current?.items ?? [],
    count: current?.count ?? null,
    hasMore: !!current?.cursor,
    loading: !current,
    loadingMore,
    error: current?.error ?? "",
    // The first page failed, so the grid has nothing to show (as opposed to a failed "load more").
    failed: !!current?.error && current.items.length === 0,
    retry: () => setAttempt((n) => n + 1),
    loadMore,
  };
}
