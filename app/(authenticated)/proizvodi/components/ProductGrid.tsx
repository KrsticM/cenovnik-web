"use client";

import { memo, useCallback, useState } from "react";
import type { CatalogItem } from "@/lib/services/products";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { InfiniteScrollSentinel } from "./InfiniteScrollSentinel";
import { GRID_CLASSES } from "../config";
import { useGridColumns } from "../hooks/useGridColumns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  items: CatalogItem[];
  showSkeleton: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  endLabel: string;
  onReset: () => void;
}

function ProductGridComponent({
  items,
  showSkeleton,
  isLoadingMore,
  hasMore,
  onLoadMore,
  endLabel,
  onReset,
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
      <Card className="rounded-2xl border-line bg-white px-6 py-[88px] text-center shadow-none">
        <span className="inline-block h-14 w-14 rounded-2xl bg-cream" aria-hidden="true" />
        <p className="mt-[18px] text-[17px] font-medium text-ink">Nema proizvoda za ove filtere.</p>
        <p className="mt-1.5 text-sm text-ink-muted">
          Probajte širi cenovni opseg ili prikažite cene iz svih marketa.
        </p>
        <Button variant="sage" onClick={onReset} className="mt-5 h-auto rounded-[22px] px-5 py-[11px] hover:bg-sage-dark">
          Prikaži sve proizvode
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <div className={GRID_CLASSES} aria-busy={isLoadingMore}>
        {items.map(({ product, price, isDeal }) => (
          <ProductCard
            key={product.id}
            product={product}
            price={price}
            isDeal={isDeal}
            expanded={expandedId === product.id}
            onExpandedChange={(expanded) => handleExpandedChange(product.id, expanded)}
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
