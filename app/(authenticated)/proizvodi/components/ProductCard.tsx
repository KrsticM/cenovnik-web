import { memo } from "react";
import { Product } from "@/types/product";
import { getProductImageUrl } from "@/lib/productImageUrl";
import { formatPrice } from "@/lib/formatPrice";

interface ProductCardProps {
  product: Product;
  price: number | undefined;
}

function ProductCardComponent({ product, price }: ProductCardProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      {/* Image */}
      <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded bg-muted">
        {product.hasImage && product.barcodes.length > 0 ? (
          <img
            src={getProductImageUrl(product.barcodes[0], "thumb")}
            alt={product.productName}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex items-center justify-center text-muted-foreground">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
        {product.productName}
      </h3>

      {/* Price */}
      <div className="mt-auto flex flex-col items-center gap-1 border-t border-border pt-3 text-center">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Najniža cena:
        </p>
        <p className="text-lg font-bold text-foreground">{formatPrice(price)}</p>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.price === nextProps.price
  );
});
