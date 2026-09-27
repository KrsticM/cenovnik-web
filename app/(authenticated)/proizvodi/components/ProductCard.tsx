"use client";

import { memo, useCallback, useRef } from "react";
import { Product } from "@/types/product";
import { ProductOffer } from "@/lib/services/products";
import { getProductImageUrl } from "@/lib/productImageUrl";
import { formatPrice, plural } from "@/lib/formatPrice";
import { useProductListControl } from "../hooks/useProductListControl";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import { QtyOverlay } from "./QtyOverlay";

interface ProductCardProps {
  product: Product;
  offers: ProductOffer[] | undefined;
  quantity: number;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

function ProductCardComponent({
  product,
  offers,
  quantity,
  expanded,
  onExpandedChange,
}: ProductCardProps) {
  const { increment, decrement, remove } = useProductListControl(product.id);
  const containerRef = useRef<HTMLElement>(null);
  const collapse = useCallback(() => onExpandedChange(false), [onExpandedChange]);
  useClickOutside(containerRef, collapse, expanded);

  const bestOffer = offers?.[0];
  const marketCount = offers?.length ?? 0;
  const storeLine = `u ${marketCount} ${plural(marketCount, "marketu", "marketa", "marketa")}`;

  const handleIncrement = useCallback(async () => {
    onExpandedChange(true);
    await increment();
  }, [increment, onExpandedChange]);

  const handleDecrement = useCallback(async () => {
    if (quantity <= 1) onExpandedChange(false);
    await decrement();
  }, [decrement, quantity, onExpandedChange]);

  const handleRemove = useCallback(async () => {
    onExpandedChange(false);
    await remove();
  }, [remove, onExpandedChange]);

  const showImage = product.hasImage && product.barcodes.length > 0;

  return (
    <article
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-line bg-white transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(26,26,26,0.09)]"
    >
      <div
        className={cn(
          "relative block aspect-square max-h-[340px] w-full overflow-hidden",
          !showImage && "stripes"
        )}
      >
        {showImage && (
          <img
            src={getProductImageUrl(product.barcodes[0], "thumb")}
            alt={product.productName}
            loading="lazy"
            className="h-full w-full object-contain p-4"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        {bestOffer?.isDeal && (
          <span className="absolute left-3 top-3 rounded-[8px] bg-rust px-2.5 py-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] text-white">
            Akcija
          </span>
        )}
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <h3 className="line-clamp-2 min-h-[38px] text-sm font-medium leading-[1.35] text-ink">
          {product.productName}
        </h3>
        <div className="mt-3 flex flex-col gap-[3px]">
          {bestOffer ? (
            <>
              <span className="whitespace-nowrap text-[19px] font-semibold tracking-[-0.01em] text-rust">
                {formatPrice(bestOffer.price)}
              </span>
              <span className="truncate text-xs text-ink-muted">{storeLine}</span>
            </>
          ) : (
            <span className="text-xs text-ink-muted">Nema dostupnih cena</span>
          )}
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
    </article>
  );
}

export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.quantity === nextProps.quantity &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.offers === nextProps.offers
  );
});
ProductCard.displayName = "ProductCard";
