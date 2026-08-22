import { memo } from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  prices: Record<string, number>;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

function ProductGridComponent({
  products,
  prices,
  loading,
  hasMore,
  onLoadMore,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center text-center">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Nema dostupnih proizvoda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            price={prices[product.id]}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={onLoadMore} variant="outline" className="w-full sm:w-auto">
            Učitaj još
          </Button>
        </div>
      )}
    </div>
  );
}

export const ProductGrid = memo(ProductGridComponent);
