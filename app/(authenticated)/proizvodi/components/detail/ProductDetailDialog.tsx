"use client";

import Link from "next/link";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { plural } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ProductThumb } from "@/components/ui/product-thumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useStickyShrink } from "../../hooks/useStickyShrink";
import { DetailAddControl } from "./DetailAddControl";
import { StoreOffers } from "./StoreOffers";

interface ProductDetailDialogProps {
  productId: string | null;
  // The card's product when it is in the loaded grid; otherwise it is fetched by id.
  known: Product | null;
  onClose: () => void;
  // Focus target after closing (the card link that opened it).
  onRestoreFocus: () => void;
}

export function ProductDetailDialog({ productId, known, onClose, onRestoreFocus }: ProductDetailDialogProps) {
  const { list, error: listError, storeIds } = useShoppingList();
  const storesReady = list !== null || !!listError;
  const detail = useProductDetail(productId, known, storeIds, storesReady);
  const { stuck, onScroll, reset } = useStickyShrink();
  const { product } = detail;
  const favCount = detail.favouriteCount;

  return (
    <Dialog
      open={productId !== null}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent
        hideClose
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
        overlayClassName="z-[70] bg-ink/40 data-[state=open]:animate-[fadeIn_180ms_ease_both]"
        className={cn(
          "z-[70] flex flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-[0_30px_80px_rgba(26,26,26,0.28)] data-[state=open]:animate-[dropIn_200ms_ease_both]",
          "inset-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 rounded-none",
          "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:w-[min(940px,calc(100%-48px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px]"
        )}
      >
        <div className="flex min-h-[60px] shrink-0 items-center gap-3 border-b border-line-soft py-2 pl-4 pr-3">
          <DialogClose asChild>
            <Button variant="pill" aria-label="Zatvori detalje proizvoda" className="h-11 w-11 shrink-0 rounded-full p-0 sm:hidden">
              <span aria-hidden="true" className="block h-2.5 w-2.5 border-b-2 border-l-2 border-ink [transform:rotate(45deg)_translate(2px,-2px)]" />
            </Button>
          </DialogClose>
          <span className="flex-1 text-[15px] font-semibold text-ink">Detalji proizvoda</span>
          <DialogClose asChild>
            <Button
              variant="pill"
              size="icon-lg"
              aria-label="Zatvori detalje proizvoda"
              className="hidden text-[17px] font-normal text-ink-muted hover:text-sage-dark sm:inline-flex"
            >
              ×
            </Button>
          </DialogClose>
        </div>

        <div onScroll={onScroll} className="flex-1 overflow-y-auto">
          <div className="grid items-start gap-5 px-4 pb-10 pt-4 sm:grid-cols-[minmax(0,360px)_minmax(0,1fr)] sm:gap-8 sm:px-7 sm:pb-8 sm:pt-7">
            <div className="sm:sticky sm:top-7">
              <ProductThumb
                barcode={product?.barcodes[0]}
                hasImage={product?.hasImage ?? false}
                alt={product?.productName ?? ""}
                size="full"
                className="mx-auto aspect-square w-full max-w-[420px] rounded-2xl border border-line-soft"
                imgClassName="p-6"
              />
            </div>

            <div className="min-w-0">
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
                      <DetailAddControl product={product} price={detail.cheapestPrice} />
                    </div>
                  </>
                ) : (
                  <>
                    <DialogTitle className="sr-only">Detalji proizvoda</DialogTitle>
                    <Skeleton className="h-4 w-32 rounded-md bg-skeleton" />
                    <Skeleton className="mt-3 h-8 w-4/5 rounded-md bg-skeleton" />
                    <Skeleton className="mt-5 h-[52px] w-full rounded-[26px] bg-skeleton" />
                  </>
                )}
                <DialogDescription className="sr-only">Cene proizvoda u tvojim marketima</DialogDescription>

                <div className={cn("flex flex-wrap items-center justify-between gap-3", stuck ? "mt-[18px]" : "mt-8")}>
                  <h3 className="text-[17px] font-semibold text-ink">Cene u tvojim marketima</h3>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-7 gap-1.5 rounded-[14px] bg-sand px-2.5 text-xs font-medium text-sage-dark hover:bg-sand-dark hover:text-sage-dark"
                  >
                    <Link
                      href="/prodavnice"
                      aria-label={`Moji marketi, ${favCount} ${plural(favCount, "prodavnica", "prodavnice", "prodavnica")} — izmeni`}
                    >
                      <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sage" />
                      Moji marketi · {favCount}
                    </Link>
                  </Button>
                </div>
              </div>

              {detail.error ? (
                <Alert variant="destructive" className="mt-3.5 border-0 bg-destructive/10">
                  {detail.error}
                </Alert>
              ) : (
                <StoreOffers
                  loading={detail.loading || !storesReady}
                  groups={detail.groups}
                  unavailable={detail.unavailable}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
