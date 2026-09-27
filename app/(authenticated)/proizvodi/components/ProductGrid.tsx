"use client";

import { memo, useCallback, useState } from "react";
import { Product } from "@/types/product";
import { ProductOffer } from "@/lib/services/products";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { InfiniteScrollSentinel } from "./InfiniteScrollSentinel";
import { GRID_CLASSES } from "../config";
import { Button } from "@/components/ui/button";


interface ProductGridProps {
  products: Product[];
  offers: Record<string, ProductOffer[]>;
  showSkeleton: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  endLabel: string;
  onReset: () => void;
}

function ProductGridComponent({
  products,
  offers,
  showSkeleton,
  isLoadingMore,
  hasMore,
  onLoadMore,
  endLabel,
  onReset,
}: ProductGridProps) {
  const { getItemByProductId } = useShoppingList();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExpandedChange = useCallback((productId: string, expanded: boolean) => {
    setExpandedId((current) => (expanded ? productId : current === productId ? null : current));
  }, []);

  if (showSkeleton) {
    return (
      <div aria-busy="true" aria-label="Učitavanje proizvoda" className={GRID_CLASSES}>
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0 && !hasMore) {
    return (
      <div className="rounded-2xl border border-line bg-white px-6 py-[88px] text-center">
        <span className="inline-block h-14 w-14 rounded-2xl bg-cream" aria-hidden="true" />
        <p className="mt-[18px] text-[17px] font-medium text-ink">Nema proizvoda za ove filtere.</p>
        <p className="mt-1.5 text-sm text-ink-muted">
          Probajte širi cenovni opseg ili prikažite cene iz svih marketa.
        </p>
        <Button variant="sage" onClick={onReset} className="mt-5 h-auto rounded-[22px] px-5 py-[11px] hover:bg-sage-dark">
          Prikaži sve proizvode
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className={GRID_CLASSES}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            offers={offers[product.id]}
            quantity={getItemByProductId(product.id)?.quantity ?? 0}
            expanded={expandedId === product.id}
            onExpandedChange={(expanded) => handleExpandedChange(product.id, expanded)}
          />
        ))}
      </div>

      <InfiniteScrollSentinel
        onIntersect={onLoadMore}
        hasMore={hasMore}
        isLoading={isLoadingMore}
        endLabel={endLabel}
      />
    </div>
  );
}

export const ProductGrid = memo(ProductGridComponent);
