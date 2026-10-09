"use client";

import { memo, useCallback, useState } from "react";
import type { CatalogItem } from "@/lib/services/products";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { InfiniteScrollSentinel } from "./InfiniteScrollSentinel";
import { GRID_CLASSES } from "@/lib/gridClasses";
import { useGridColumns } from "../hooks/useGridColumns";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface ProductGridProps {
  items: CatalogItem[];
  showSkeleton: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  endLabel: string;
  onReset: () => void;
  onOpenProduct: (productId: string, trigger: HTMLElement) => void;
}

function ProductGridComponent({
  items,
  showSkeleton,
  isLoadingMore,
  hasMore,
  onLoadMore,
  endLabel,
  onReset,
  onOpenProduct,
}: ProductGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const columns = useGridColumns();
  // While more is loading, fill the gaps in the last row and add one full row of placeholders.
  const placeholderCount = hasMore ? ((columns - (items.length % columns)) % columns) + columns : 0;

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

  if (items.length === 0 && !hasMore) {
    return (
      <EmptyState
        variant="card"
        illustration="no-results"
        title="Nema proizvoda za ove filtere."
        description="Probaj širi cenovni opseg ili prikaži cene iz svih marketa."
        action={
          <Button variant="sage" size="pill-md" onClick={onReset} className="hover:bg-sage-dark">
            Prikaži sve proizvode
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className={GRID_CLASSES} aria-busy={isLoadingMore}>
        {items.map(({ product, price, regularPrice, isDeal }) => (
          <ProductCard
            key={product.id}
            product={product}
            price={price}
            regularPrice={regularPrice}
            isDeal={isDeal}
            expanded={expandedId === product.id}
            onExpandedChange={(expanded) => handleExpandedChange(product.id, expanded)}
            onOpen={onOpenProduct}
          />
        ))}
        {Array.from({ length: placeholderCount }, (_, i) => (
          <ProductCardSkeleton key={`placeholder-${i}`} />
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
