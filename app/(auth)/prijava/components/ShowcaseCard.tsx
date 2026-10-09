import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DealPrice } from "@/components/ui/deal-price";
import { ProductThumb } from "@/components/ui/product-thumb";
import type { CatalogItem } from "@/lib/services/products";

// The /proizvodi card without its list controls; it only decorates the sign-in background.
export function ShowcaseCard({ item }: { item: CatalogItem }) {
  const { product, price, regularPrice, isDeal } = item;
  return (
    <Card className="overflow-hidden rounded-2xl border-line bg-white shadow-none">
      <ProductThumb
        barcode={product.barcodes[0]}
        hasImage={product.hasImage}
        alt=""
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
        <p className="line-clamp-2 min-h-[38px] text-sm font-medium leading-[1.35] text-ink">{product.productName}</p>
        <div className="mt-3">
          <DealPrice price={price} regularPrice={isDeal ? regularPrice : null} size="card" layout="below" />
        </div>
      </div>
    </Card>
  );
}
