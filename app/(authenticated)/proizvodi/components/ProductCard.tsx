"use client";

import { memo, useCallback, useRef } from "react";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { ProductThumb } from "@/components/ui/product-thumb";
import { useProductListControl } from "../hooks/useProductListControl";
import { useClickOutside } from "@/hooks/useClickOutside";
import { QtyOverlay } from "./QtyOverlay";

interface ProductCardProps {
  product: Product;
  price: number;
  isDeal: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

function ProductCardComponent({
  product,
  price,
  isDeal,
  expanded,
  onExpandedChange,
}: ProductCardProps) {
  // The card reads its own quantity, so the grid doesn't have to subscribe to the list.
  const { quantity, increment, decrement, remove } = useProductListControl(product, price);
  const containerRef = useRef<HTMLDivElement>(null);
  const collapse = useCallback(() => onExpandedChange(false), [onExpandedChange]);
  useClickOutside(containerRef, collapse, expanded);

  const handleIncrement = () => {
    onExpandedChange(true);
    increment();
  };

  const handleDecrement = () => {
    if (quantity <= 1) onExpandedChange(false);
    decrement();
  };

  const handleRemove = () => {
    onExpandedChange(false);
    remove();
  };

  return (
    <Card
      ref={containerRef}
      role="article"
      className="relative overflow-hidden rounded-2xl border-line bg-white shadow-none transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(26,26,26,0.09)]"
    >
      <ProductThumb
        barcode={product.barcodes[0]}
        hasImage={product.hasImage}
        alt={product.productName}
        className="aspect-square max-h-[340px] w-full"
        imgClassName="p-4"
      >
        {isDeal && (
          <Badge variant="deal" className="absolute left-3 top-3">
            Akcija
          </Badge>
        )}
      </ProductThumb>

      <div className="px-4 pb-4 pt-3.5">
        <h3 className="line-clamp-2 min-h-[38px] text-sm font-medium leading-[1.35] text-ink">
          {product.productName}
        </h3>
        <div className="mt-3 flex flex-col gap-[3px]">
          <Price value={price} size="card" />
        </div>
      </div>

      <div className="absolute right-3 top-3">
        <QtyOverlay
          quantity={quantity}
          expanded={expanded}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
          onExpand={() => onExpandedChange(true)}
        />
      </div>
    </Card>
  );
}

// onExpandedChange is a fresh closure per render but always targets the same product id.
export const ProductCard = memo(
  ProductCardComponent,
  (prev, next) =>
    prev.product.id === next.product.id &&
    prev.expanded === next.expanded &&
    prev.price === next.price &&
    prev.isDeal === next.isDeal
);
ProductCard.displayName = "ProductCard";
