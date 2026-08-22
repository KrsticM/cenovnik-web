import { useState, useEffect, useRef } from "react";
import { searchProducts } from "@/lib/services/products";
import { Product } from "@/types/product";

const SEARCH_DEBOUNCE_MS = 400;

export function useProductSearch(
  onProductsChange: (products: Product[], isSearchMode: boolean) => void
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFound, setSearchFound] = useState<number | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [error, setError] = useState<string>("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setSearchFound(null);
      onProductsChange([], false);
      return;
    }

    setIsSearchMode(true);

    debounceRef.current = setTimeout(async () => {
      try {
        setError("");
        const result = await searchProducts(searchQuery, 1);
        onProductsChange(result.products, true);
        setSearchFound(result.found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Greška pri pretrazi.");
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchFound,
    isSearchMode,
    error,
  };
}
