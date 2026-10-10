"use client";

import { Suspense, useRef, useState } from "react";
import { OpenMyMarketsButton } from "@/components/MyMarketsDialog/OpenMyMarketsButton";
import { useFavouriteStores } from "@/contexts/ShoppingListContext";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useProductSearch } from "./hooks/useProductSearch";
import { useProductCatalog } from "./hooks/useProductCatalog";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { useProductFilters } from "./hooks/useProductFilters";
import { useSearchDock } from "./hooks/useSearchDock";
import { useSearchSuggestions } from "./hooks/useSearchSuggestions";
import { useProductDetailParam } from "./hooks/useProductDetailParam";
import { SearchDock, SearchBindings } from "./components/SearchDock";
import { CompactBandSearch, CompactDockedSearch } from "./components/CompactSearch";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGrid } from "./components/ProductGrid";
import { FilterBar } from "./components/FilterBar";
import { FilterDrawer } from "./components/FilterDrawer";
import { ActiveFilterChips } from "./components/ActiveFilterChips";
import { SortMenu } from "./components/SortMenu";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { ProductDetailDialog } from "./components/detail/ProductDetailDialog";
import { catalogHeading, catalogSubtitle, countLabel } from "./catalogLabels";

function ProizvodiContent() {
  const { storeIds, ready: storesReady } = useFavouriteStores();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const bandRef = useRef<HTMLElement>(null);
  const bandFieldRef = useRef<HTMLDivElement>(null);
  const { slotTop, docked, narrow } = useSearchDock(bandRef, bandFieldRef);

  const search = useProductSearch();
  const filters = useProductFilters();
  const scope = filters.myMarkets ? storeIds : null;

  // Wait for the user's stores so the first request already has the right market scope.
  const catalog = useProductCatalog(
    {
      query: search.liveQuery,
      storeIds: scope,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      dealsOnly: filters.dealsOnly,
    },
    filters.sort,
    storesReady
  );

  const suggestions = useSearchSuggestions(search.query, scope);
  const recentSearches = useRecentSearches();
  const detail = useProductDetailParam(catalog.items);

  const searchBindings: SearchBindings = {
    value: search.query,
    onChange: search.setQuery,
    onCommit: (value) => {
      search.commit(value);
      recentSearches.add(value);
    },
    // A product suggestion opens that product; the typed words still count as a recent search.
    onPickSuggestion: (productId) => {
      recentSearches.add(search.query);
      detail.open(productId);
    },
    suggestions,
    recent: recentSearches.items,
    onClearRecent: recentSearches.clear,
    searching: search.searching,
  };

  const showSkeleton = search.searching || catalog.loading;

  const live = search.liveQuery;
  const count = catalog.count;
  const heading = catalogHeading(live);
  const subtitle = catalogSubtitle({ count, loading: catalog.loading, liveQuery: live, myMarkets: filters.myMarkets });

  const filterControls = {
    myMarkets: filters.myMarkets,
    onMyMarketsChange: filters.setMyMarkets,
    priceRange: filters.priceRange,
    onPriceToggle: filters.togglePriceRange,
    dealsOnly: filters.dealsOnly,
    onDealsOnlyChange: filters.setDealsOnly,
    hasFilters: filters.activeCount > 0,
    onClear: filters.clearFilters,
  };

  const resetAll = () => {
    filters.clearFilters();
    search.clear();
    setFiltersOpen(false);
  };

  return (
    <>
      <SearchDock search={searchBindings} slotTop={slotTop} docked={docked} narrow={narrow} />
      <CompactDockedSearch search={searchBindings} docked={docked} />

      <section
        ref={bandRef}
        aria-label="Pretraga"
        className={`border-b transition-colors duration-180 ${
          docked ? "border-paper bg-paper" : "border-cream-band-border bg-cream"
        }`}
      >
        <div
          className="mx-auto flex max-w-[1360px] flex-col items-center gap-[18px] px-4 pb-[26px] pt-7 sm:px-5 sm:pb-[30px] lg:px-8 lg:pb-10 lg:pt-10 2xl:max-w-[1720px] 2xl:px-12"
          style={{ visibility: docked ? "hidden" : "visible" }}
        >
          <div ref={bandFieldRef} aria-hidden="true" className="hidden h-[62px] w-full max-w-[720px] lg:block" />
          <CompactBandSearch search={searchBindings} />

          <Alert
            role="note"
            className="flex w-auto flex-wrap items-center justify-center gap-2 border-0 bg-transparent p-0 text-center text-sm text-ink-warm"
          >
            <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sage" />
            {filters.myMarkets ? (
              <span>
                Pretraga i cene obuhvataju artikle iz{" "}
                <OpenMyMarketsButton variant="underline" size="text" className="inline font-semibold hover:text-sage-darker">
                  tvojih omiljenih marketa
                </OpenMyMarketsButton>
              </span>
            ) : (
              <span>
                Prikazane su cene iz svih marketa.{" "}
                <Button
                  variant="underline"
                  size="text"
                  onClick={() => filters.setMyMarkets(true)}
                  className="inline font-semibold hover:text-sage-dark"
                >
                  Prikaži samo cene iz mojih marketa
                </Button>
              </span>
            )}
          </Alert>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1360px] px-4 pb-16 pt-7 sm:px-5 sm:pb-[72px] sm:pt-8 lg:px-8 lg:pb-24 lg:pt-10 2xl:max-w-[1720px] 2xl:px-12 2xl:pb-28">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="m-0 text-[26px] font-semibold tracking-[-0.03em] text-ink lg:text-[34px]">
              {heading}
            </h1>
            <p aria-live="polite" className="mt-2 min-h-[22px] text-[15px] text-ink-muted">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {live && (
              <Button variant="pill-muted" size="pill" onClick={search.clear}>
                Očisti pretragu ×
              </Button>
            )}
            <Button variant="pill" size="pill" onClick={() => setFiltersOpen(true)} className="lg:hidden">
              Filteri
              {filters.activeCount > 0 && (
                <Badge variant="count-sm">{filters.activeCount}</Badge>
              )}
            </Button>
            <SortMenu value={filters.sort} onChange={filters.setSort} />
          </div>
        </div>

        <FilterBar {...filterControls} />
        <ActiveFilterChips chips={filters.activeChips} onClear={filters.clearFilters} />

        {catalog.failed ? (
          <EmptyState
            variant="card"
            illustration="error"
            title={catalog.error}
            description="Proveri internet konekciju i pokušaj ponovo za koji trenutak."
            action={
              <Button variant="sage" size="pill-md" onClick={catalog.retry} className="hover:bg-sage-dark">
                Pokušaj ponovo
              </Button>
            }
          />
        ) : (
          <>
            {catalog.error && (
              <Alert variant="destructive" className="mb-6 border-0 bg-destructive/10">
                {catalog.error}
              </Alert>
            )}
            <ProductGrid
              items={catalog.items}
              showSkeleton={showSkeleton}
              isLoadingMore={catalog.loadingMore}
              hasMore={catalog.hasMore}
              onLoadMore={catalog.loadMore}
              endLabel={live ? "To je sve za ovu pretragu." : "To je sve za sada."}
              onReset={resetAll}
              onOpenProduct={detail.open}
            />
          </>
        )}
      </main>

      <FilterDrawer
        {...filterControls}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        resultLabel={count === null ? "proizvode" : countLabel(count)}
      />

      <ScrollToTopButton />

      <ProductDetailDialog
        productId={detail.productId}
        known={detail.knownProduct}
        onClose={detail.close}
        onRestoreFocus={detail.restoreFocus}
      />
    </>
  );
}

export default function ProizvodiPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Učitavam...</div>}>
      <ProizvodiContent />
    </Suspense>
  );
}
