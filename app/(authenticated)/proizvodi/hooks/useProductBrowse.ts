import { useState, useCallback, useRef } from "react";
import { fetchProducts } from "@/lib/services/products";
import { Product } from "@/types/product";
import { PRODUCTS_PER_PAGE } from "../config";

export function useProductBrowse() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const pageRef = useRef(1);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchProducts(PRODUCTS_PER_PAGE);
      setProducts(result);
      pageRef.current = 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju proizvoda.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    try {
      setError("");
      pageRef.current += 1;
      const result = await fetchProducts(PRODUCTS_PER_PAGE);
      setProducts((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        return [...prev, ...result.filter((p) => !prevIds.has(p.id))];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju više proizvoda.");
    }
  }, []);

  return {
    products,
    setProducts,
    loading,
    error,
    page: pageRef.current,
    loadInitial,
    loadMore,
  };
}
