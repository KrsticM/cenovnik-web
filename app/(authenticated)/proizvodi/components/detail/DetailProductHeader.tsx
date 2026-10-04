import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailAddControl } from "./DetailAddControl";
import { MyMarketsChip } from "./MyMarketsChip";

interface DetailProductHeaderProps {
  product: Product | null;
  stuck: boolean;
  cheapestPrice?: number;
  favouriteCount: number;
}

export function DetailProductHeader({ product, stuck, cheapestPrice, favouriteCount }: DetailProductHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-[2] -mx-4 -mt-4 bg-white px-4 pb-3.5 pt-4 transition-shadow duration-[160ms] sm:-ml-4 sm:-mr-7 sm:-mt-7 sm:pl-4 sm:pr-7 sm:pt-7",
        stuck && "shadow-[0_10px_14px_-12px_rgba(26,26,26,0.22)]"
      )}
    >
      {product ? (
        <>
          <p className="text-[13px] tracking-[0.02em] text-ink-muted">{product.barcodes[0]}</p>
          <DialogTitle
            className={cn(
              "mt-1.5 text-pretty font-semibold leading-[1.2] tracking-[-0.02em] text-ink transition-[font-size] duration-[160ms]",
              stuck ? "text-[19px] sm:text-[21px]" : "text-[23px] sm:text-[26px]"
            )}
          >
            {product.productName}
          </DialogTitle>
          <div className="mt-5">
            <DetailAddControl product={product} price={cheapestPrice} />
          </div>
        </>
      ) : (
        <>
          <DialogTitle className="sr-only">Detalji proizvoda</DialogTitle>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-8 w-4/5" />
          <Skeleton className="mt-5 h-[52px] w-full rounded-full" />
        </>
      )}
      <DialogDescription className="sr-only">Cene proizvoda u tvojim marketima</DialogDescription>

      <div className={cn("flex flex-wrap items-center justify-between gap-3", stuck ? "mt-[18px]" : "mt-8")}>
        <h3 className="text-[17px] font-semibold text-ink">Cene u tvojim marketima</h3>
        <MyMarketsChip count={favouriteCount} />
      </div>
    </div>
  );
}
