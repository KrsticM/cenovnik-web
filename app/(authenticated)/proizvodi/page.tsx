"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts, searchProducts, fetchLowestPrices } from "@/lib/services/products";
import { getUserStoreIds } from "@/lib/services/userStores";
import { getProductImageUrl } from "@/lib/productImageUrl";
import { formatPrice } from "@/lib/formatPrice";
import { Product } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";

const SEARCH_DEBOUNCE_MS = 400;

function ProizvodiContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [lowestPrices, setLowestPrices] = useState<Record<string, number>>({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchFound, setSearchFound] = useState<number | null>(null);
  const [userStoreIds, setUserStoreIds] = useState<string[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pricesFetchedRef = useRef(new Set<string>());

  // Load user's favorite stores
  useEffect(() => {
    const loadUserStores = async () => {
      if (!user?.id) return;
      try {
        const storeIds = await getUserStoreIds(user.id);
        setUserStoreIds(storeIds);
      } catch (err) {
        console.error("Failed to fetch user stores:", err);
      }
    };

    loadUserStores();
  }, [user?.id]);

  // Load initial browse feed
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await fetchProducts(20);
        setProducts(result);
        setPage(1);
        setHasMore(false);
        setIsSearchMode(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Greška pri učitavanju proizvoda.");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  // Fetch prices when products change
  useEffect(() => {
    const fetchMissingPrices = async () => {
      const missing = products.filter((p) => !pricesFetchedRef.current.has(p.id)).map((p) => p.id);
      if (missing.length === 0) return;

      try {
        const prices = await fetchLowestPrices(missing, userStoreIds.length > 0 ? userStoreIds : undefined);
        setLowestPrices((prev) => ({ ...prev, ...prices }));
        missing.forEach((id) => pricesFetchedRef.current.add(id));
      } catch (err) {
        console.error("Failed to fetch prices:", err);
      }
    };

    if (products.length > 0 && userStoreIds.length > 0) {
      fetchMissingPrices();
    }
  }, [products.length, userStoreIds]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      debounceRef.current = setTimeout(() => {
        setIsSearchMode(false);
        setSearchFound(null);
        setPage(1);
      }, 0);
      return;
    }

    setIsSearchMode(true);

    debounceRef.current = setTimeout(async () => {
      try {
        setError("");
        const result = await searchProducts(searchQuery, 1);
        setProducts(result.products);
        setHasMore(result.hasMore);
        setSearchFound(result.found);
        setPage(1);
        pricesFetchedRef.current.clear();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Greška pri pretrazi.");
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const loadMore = useCallback(async () => {
    try {
      setError("");
      const nextPage = page + 1;

      if (isSearchMode) {
        const result = await searchProducts(searchQuery, nextPage);
        setProducts((prev) => [...prev, ...result.products]);
        setHasMore(result.hasMore);
        setPage(nextPage);
      } else {
        const result = await fetchProducts(20);
        const newIds = new Set(result.map((p) => p.id));
        setProducts((prev) => [...prev, ...result.filter((p) => !prev.some((ex) => ex.id === p.id))]);
        setPage(nextPage);
      }
      pricesFetchedRef.current.clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju više proizvoda.");
    }
  }, [page, isSearchMode, searchQuery]);

  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Search bar */}
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium text-foreground">
            Pretraži proizvode
          </label>
          <Input
            id="search"
            type="text"
            placeholder="Unesite naziv ili barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Info */}
        {isSearchMode && searchFound !== null && (
          <div className="text-sm text-muted-foreground">
            Pronađeno {searchFound} {searchFound === 1 ? "proizvod" : searchFound < 5 ? "proizvoda" : "proizvoda"}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && !error && (
          <div className="flex min-h-40 items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {isSearchMode ? "Nema pronađenih proizvoda" : "Nema dostupnih proizvoda"}
              </p>
            </div>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {products.map((product) => (
                <div key={product.id} className="rounded-lg border border-border bg-card p-4">
                  {/* Image */}
                  <div className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded bg-muted">
                    {product.hasImage && product.barcodes.length > 0 ? (
                      <img
                        src={getProductImageUrl(product.barcodes[0], "thumb")}
                        alt={product.productName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center text-muted-foreground">
                        <svg
                          className="h-8 w-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{product.productName}</h3>

                  {/* Price */}
                  <div className="mt-3 space-y-1 border-t border-border pt-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Najniža cena:</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatPrice(lowestPrices[product.id])}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more button */}
            {(hasMore || !isSearchMode) && (
              <div className="flex justify-center">
                <Button onClick={loadMore} variant="outline" className="w-full sm:w-auto">
                  Učitaj još
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProizvodiPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Učitavam...</div>}>
      <ProizvodiContent />
    </Suspense>
  );
}
