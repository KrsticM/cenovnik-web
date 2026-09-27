"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { plural } from "@/lib/formatPrice";
import { Button } from "@/components/ui/button";
import { useProductBrowse } from "./hooks/useProductBrowse";
import { useProductSearch } from "./hooks/useProductSearch";
import { useProductOffers } from "./hooks/useProductOffers";
import { useProductFilters } from "./hooks/useProductFilters";
import { useSearchDock } from "./hooks/useSearchDock";
import { useSearchSuggestions } from "./hooks/useSearchSuggestions";
import { SearchDock, SearchBindings } from "./components/SearchDock";
import { CompactBandSearch, CompactDockedSearch } from "./components/CompactSearch";
import { ProductGrid } from "./components/ProductGrid";
import { FilterBar } from "./components/FilterBar";
import { FilterDrawer } from "./components/FilterDrawer";
import { ActiveFilterChips } from "./components/ActiveFilterChips";
import { SortMenu } from "./components/SortMenu";
import { ScrollToTopButton } from "./components/ScrollToTopButton";

function ProizvodiContent() {
  const { storeIds } = useShoppingList();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const bandRef = useRef<HTMLElement>(null);
  const bandFieldRef = useRef<HTMLDivElement>(null);
  const { slotTop, docked, narrow } = useSearchDock(bandRef, bandFieldRef);

  const browse = useProductBrowse();
  const search = useProductSearch();
  const filters = useProductFilters();

  const source = search.isSearchMode ? search.results : browse.products;
  const { offers, isLoadingOffers } = useProductOffers(
    source,
    filters.myMarkets ? storeIds : null
  );
  const { apply } = filters;
  const visible = useMemo(() => apply(source, offers), [apply, source, offers]);

  const { loadInitial } = browse;
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const suggestions = useSearchSuggestions(search.query, filters.myMarkets ? storeIds : null);

  const searchBindings: SearchBindings = {
    value: search.query,
    onChange: search.setQuery,
    onCommit: (value) => search.commit(value),
    suggestions,
    searching: search.searching,
  };

  const sourceLoading = search.isSearchMode ? search.loadingResults : browse.loading;
  const showSkeleton =
    search.searching || sourceLoading || (visible.length === 0 && isLoadingOffers);
  const hasMore = search.isSearchMode ? search.hasMore : true;
  const loadingMore =
    (search.isSearchMode ? search.loadingMore : browse.loadingMore) || isLoadingOffers;

  const live = search.liveQuery;
  const heading = live ? `Rezultati za „${live}“` : "Proizvodi";
  const subtitle = live
    ? search.loadingResults
      ? ""
      : `${search.found} ${plural(search.found, "proizvod odgovara", "proizvoda odgovaraju", "proizvoda odgovara")} pretrazi`
    : filters.myMarkets
      ? "Cene iz vaših marketa"
      : "Cene iz svih marketa";
  const error = browse.error || search.error;

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

          <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm text-ink-warm">
            <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sage" />
            {filters.myMarkets ? (
              <span>
                Pretraga i cene obuhvataju artikle iz{" "}
                <Link
                  href="/prodavnice"
                  className="font-semibold text-sage-dark underline underline-offset-2 hover:text-sage-darker"
                >
                  vaših omiljenih marketa
                </Link>
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
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1360px] px-4 pb-16 pt-7 sm:px-5 sm:pb-[72px] sm:pt-8 lg:px-8 lg:pb-24 lg:pt-10 2xl:max-w-[1720px] 2xl:px-12 2xl:pb-28">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="m-0 text-[26px] font-semibold tracking-[-0.03em] text-ink lg:text-[34px]">
              {heading}
            </h1>
            <p className="mt-2 min-h-[22px] text-[15px] text-ink-muted">{subtitle}</p>
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
                <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[11px] bg-sage-dark px-1.5 text-xs font-semibold text-cream">
                  {filters.activeCount}
                </span>
              )}
            </Button>
            <SortMenu value={filters.sort} onChange={filters.setSort} />
          </div>
        </div>

        <FilterBar {...filterControls} />
        <ActiveFilterChips chips={filters.activeChips} onClear={filters.clearFilters} />

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <ProductGrid
          products={visible}
          offers={offers}
          showSkeleton={showSkeleton}
          isLoadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={search.isSearchMode ? search.loadMore : browse.loadMore}
          endLabel={live ? "To je sve za ovu pretragu." : "To je sve za sada."}
          onReset={resetAll}
        />
      </main>

      <FilterDrawer
        {...filterControls}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        resultCount={visible.length}
      />

      <ScrollToTopButton />
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
