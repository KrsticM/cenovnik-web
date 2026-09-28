import { useCallback, useMemo, useState } from "react";
import type { BrowseSort } from "@/lib/services/products";

export const PRICE_PRESETS = [
  { min: 0, max: 200, label: "do 200 RSD" },
  { min: 200, max: 500, label: "200–500 RSD" },
  { min: 500, max: 1000, label: "500–1.000 RSD" },
  { min: 1000, max: Infinity, label: "1.000+ RSD" },
] as const;

export type ActiveFilterChip = { key: string; label: string; ariaLabel: string; remove: () => void };

export function useProductFilters() {
  const [myMarkets, setMyMarkets] = useState(true);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sort, setSort] = useState<BrowseSort>("relevance");

  const clearFilters = useCallback(() => {
    setMyMarkets(true);
    setPriceRange(null);
    setDealsOnly(false);
  }, []);

  const togglePriceRange = useCallback(
    (index: number) => setPriceRange((current) => (current === index ? null : index)),
    []
  );

  const activeChips = useMemo(() => {
    const chips: ActiveFilterChip[] = [];
    if (!myMarkets) {
      chips.push({ key: "markets", label: "Svi marketi", ariaLabel: "Ukloni filter: svi marketi", remove: () => setMyMarkets(true) });
    }
    if (priceRange !== null) {
      chips.push({ key: "price", label: PRICE_PRESETS[priceRange].label, ariaLabel: "Ukloni filter cene", remove: () => setPriceRange(null) });
    }
    if (dealsOnly) {
      chips.push({ key: "deals", label: "Samo akcije", ariaLabel: "Ukloni filter: samo akcije", remove: () => setDealsOnly(false) });
    }
    return chips;
  }, [myMarkets, priceRange, dealsOnly]);

  const range = priceRange === null ? null : PRICE_PRESETS[priceRange];

  return {
    myMarkets,
    setMyMarkets,
    priceRange,
    togglePriceRange,
    dealsOnly,
    setDealsOnly,
    sort,
    setSort,
    activeChips,
    activeCount: activeChips.length,
    clearFilters,
    priceMin: range ? range.min : null,
    priceMax: range && Number.isFinite(range.max) ? range.max : null,
  };
}
