import { useCallback, useMemo, useState } from "react";
import { Product } from "@/types/product";
import { ProductOffer } from "@/lib/services/products";

export type SortKey = "relevance" | "price_asc" | "price_desc" | "name";

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
  const [sort, setSort] = useState<SortKey>("relevance");

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

  // Products whose offers haven't arrived yet are held back so they don't flash in unpriced.
  const apply = useCallback(
    (products: Product[], offers: Record<string, ProductOffer[]>) => {
      const range = priceRange === null ? null : PRICE_PRESETS[priceRange];
      const visible = products.filter((product) => {
        const best = offers[product.id]?.[0];
        if (!best) return false;
        if (range && (best.price < range.min || best.price >= range.max)) return false;
        if (dealsOnly && !best.isDeal) return false;
        return true;
      });

      const price = (p: Product) => offers[p.id][0].price;
      if (sort === "price_asc") visible.sort((a, b) => price(a) - price(b));
      else if (sort === "price_desc") visible.sort((a, b) => price(b) - price(a));
      else if (sort === "name") visible.sort((a, b) => a.productName.localeCompare(b.productName, "sr"));
      return visible;
    },
    [priceRange, dealsOnly, sort]
  );

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
    apply,
  };
}
