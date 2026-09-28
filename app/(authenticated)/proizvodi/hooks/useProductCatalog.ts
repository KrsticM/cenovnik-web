import { useCallback, useEffect, useState } from "react";
import {
  browseProducts,
  countProducts,
  type BrowseCursor,
  type BrowseFilters,
  type BrowseSort,
  type CatalogItem,
} from "@/lib/services/products";
import { PRODUCTS_PER_PAGE } from "../config";

type CatalogState = {
  key: string;
  items: CatalogItem[];
  cursor: BrowseCursor | null;
  count: number | null;
  error: string;
};

const EMPTY: CatalogState = { key: "", items: [], cursor: null, count: null, error: "" };

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

// Server-side catalog: search, market scope, filters and sort run in the database
// (browse_products); pages continue from a cursor. `enabled` waits until the user's
// stores are known so the first request already has the right scope.
export function useProductCatalog(filters: BrowseFilters, sort: BrowseSort, enabled: boolean) {
  // Stable per session so "Preporučeno" keeps one shuffled order while scrolling.
  const [seed] = useState(() => Math.random().toString(36).slice(2));
  const [state, setState] = useState<CatalogState>(EMPTY);
  const [loadingMore, setLoadingMore] = useState(false);

  const key = JSON.stringify([filters, sort]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const requestFilters: BrowseFilters = JSON.parse(key)[0];

    Promise.all([
      browseProducts(requestFilters, { sort, seed, limit: PRODUCTS_PER_PAGE }),
      countProducts(requestFilters).catch(() => null),
    ])
      .then(([page, count]) => {
        if (!cancelled) setState({ key, items: page.items, cursor: page.nextCursor, count, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ ...EMPTY, key, error: errorMessage(err, "Greška pri učitavanju proizvoda.") });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, sort, seed, enabled]);

  const current = state.key === key ? state : null;

  const loadMore = useCallback(async () => {
    if (!current?.cursor || loadingMore) return;
    const forKey = current.key;
    const after = current.cursor;
    setLoadingMore(true);
    try {
      const page = await browseProducts(JSON.parse(forKey)[0], { sort, seed, limit: PRODUCTS_PER_PAGE, after });
      setState((prev) =>
        prev.key === forKey
          ? { ...prev, items: [...prev.items, ...page.items], cursor: page.nextCursor }
          : prev
      );
    } catch (err) {
      setState((prev) =>
        prev.key === forKey ? { ...prev, error: errorMessage(err, "Greška pri učitavanju više proizvoda.") } : prev
      );
    } finally {
      setLoadingMore(false);
    }
  }, [current, loadingMore, sort, seed]);

  return {
    items: current?.items ?? [],
    count: current?.count ?? null,
    hasMore: !!current?.cursor,
    loading: !current,
    loadingMore,
    error: current?.error ?? "",
    loadMore,
  };
}
