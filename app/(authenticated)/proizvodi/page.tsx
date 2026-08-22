"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserStoreIds } from "@/lib/services/userStores";
import { searchProducts } from "@/lib/services/products";
import { useProductBrowse } from "./hooks/useProductBrowse";
import { useProductSearch } from "./hooks/useProductSearch";
import { useProductPrices } from "./hooks/useProductPrices";
import { SearchBar } from "./components/SearchBar";
import { ProductGrid } from "./components/ProductGrid";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { Container } from "@/components/ui/container";
import { PRODUCTS_PER_PAGE } from "./config";

function ProizvodiContent() {
  const { user } = useAuth();
  const [userStoreIds, setUserStoreIds] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<string>("");
  const [hasMore, setHasMore] = useState(false);

  const browse = useProductBrowse();

  const handleSearchChange = useCallback(
    (products: any[], isSearchMode: boolean) => {
      if (isSearchMode) {
        browse.setProducts(products);
        setHasMore(products.length === PRODUCTS_PER_PAGE);
      } else {
        browse.loadInitial();
        setHasMore(false);
      }
    },
    [browse]
  );

  const search = useProductSearch(handleSearchChange);
  const prices = useProductPrices(browse.products, userStoreIds);

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

  // Load initial browse on mount
  useEffect(() => {
    browse.loadInitial();
  }, []);

  const handleLoadMore = useCallback(async () => {
    try {
      setSearchError("");
      if (search.isSearchMode) {
        const nextPage = browse.page + 1;
        const result = await searchProducts(search.searchQuery, nextPage);
        browse.setProducts((prev) => [...prev, ...result.products]);
        setHasMore(result.products.length === PRODUCTS_PER_PAGE);
        prices.clearPrices();
      } else {
        await browse.loadMore();
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Greška pri učitavanju više proizvoda.");
    }
  }, [search.isSearchMode, search.searchQuery, browse.page, browse.setProducts, browse.loadMore, prices.clearPrices]);

  const error = browse.error || search.error || searchError;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Container size="full" className="flex flex-col">
        <div className="sticky top-16 z-30 -mx-4 bg-background px-4 py-6 shadow-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <SearchBar
            value={search.searchQuery}
            onChange={search.setSearchQuery}
            onClear={() => search.setSearchQuery("")}
            searchFound={search.searchFound}
            isSearchMode={search.isSearchMode}
          />
        </div>

        <div className="space-y-6 py-6">
          {error && (
            <div className="rounded bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <ProductGrid
            products={browse.products}
            prices={prices.lowestPrices}
            loading={browse.loading}
            hasMore={hasMore || !search.isSearchMode}
            onLoadMore={handleLoadMore}
          />
        </div>
      </Container>

      <ScrollToTopButton />
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
