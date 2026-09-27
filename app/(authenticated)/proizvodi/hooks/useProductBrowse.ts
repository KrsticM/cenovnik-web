import { useState, useCallback, useRef } from "react";
import { fetchProducts } from "@/lib/services/products";
import { Product } from "@/types/product";
import { PRODUCTS_PER_PAGE } from "../config";

export function useProductBrowse() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>("");
  const loadingMoreRef = useRef(false);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setProducts(await fetchProducts(PRODUCTS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju proizvoda.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      setError("");
      const result = await fetchProducts(PRODUCTS_PER_PAGE);
      setProducts((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        return [...prev, ...result.filter((p) => !prevIds.has(p.id))];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri učitavanju više proizvoda.");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  return { products, loading, loadingMore, error, loadInitial, loadMore };
}
