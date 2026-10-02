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
import { StateIllustration } from "@/components/ui/state-illustration";

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
      <Card className="rounded-2xl border-line bg-white px-6 py-[88px] text-center shadow-none">
        <StateIllustration variant="no-results" />
        <p className="mt-[22px] text-[17px] font-medium text-ink">Nema proizvoda za ove filtere.</p>
        <p className="mt-1.5 text-sm text-ink-muted">
          Probaj širi cenovni opseg ili prikaži cene iz svih marketa.
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
