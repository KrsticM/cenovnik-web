"use client";

import { cn } from "@/lib/utils";
import { AD_SLOTS, detailAdSize } from "@/lib/ads";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { AdSenseAd } from "@/components/AdSense/AdSenseAd";
import type { Product } from "@/types/product";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductThumb } from "@/components/ui/product-thumb";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useStickyShrink } from "../../hooks/useStickyShrink";
import { DetailProductHeader } from "./DetailProductHeader";
import { DetailTopBar } from "./DetailTopBar";
import { StoreOffers } from "./StoreOffers";

interface ProductDetailDialogProps {
  productId: string | null;
  known: Product | null;
  onClose: () => void;
  onRestoreFocus: () => void;
  showAds: boolean;
}

function DetailAd({ className }: { className?: string }) {
  const phone = !useMediaQuery("(min-width: 640px)");
  return <AdSenseAd slot={AD_SLOTS.detail} size={detailAdSize(phone)} className={className} />;
}

export function ProductDetailDialog({ productId, known, onClose, onRestoreFocus, showAds }: ProductDetailDialogProps) {
  const { product, offers, favouriteCount } = useProductDetail(productId, known);
  const { stuck, onScroll, reset } = useStickyShrink();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const cheapestPrice = offers.status === "ready" ? (offers.cheapestPrice ?? undefined) : undefined;
  const showAd = showAds && offers.status === "ready" && offers.groups.length > 0;
  const adInColumn = showAd && desktop;

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
        overlayClassName="z-[70] bg-scrim data-[state=open]:animate-[fadeIn_180ms_ease_both]"
        className={cn(
          "z-[70] flex flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-modal data-[state=open]:animate-[dropIn_200ms_ease_both]",
          "inset-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 rounded-none",
          "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:w-[min(940px,calc(100%-48px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px]"
        )}
      >
        <DetailTopBar />

        <div onScroll={onScroll} className="flex-1 overflow-y-auto">
          <div className="grid items-start gap-5 px-4 pb-10 pt-4 sm:px-7 sm:pb-8 sm:pt-7 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-8">
            {/* Two columns only from lg: narrower modals stack like the phone, or the price column gets squeezed. */}
            <div
              className={cn(
                "lg:top-7",
                // With the ad under it, the photo only sticks where both still fit on screen.
                adInColumn ? "[@media(min-width:1024px)_and_(min-height:820px)]:sticky" : "lg:sticky"
              )}
            >
              <ProductThumb
                barcode={product?.barcodes[0]}
                hasImage={product?.hasImage ?? false}
                alt={product?.productName ?? ""}
                size="full"
                className="mx-auto aspect-square w-full max-w-[420px] rounded-2xl border border-line-soft"
                imgClassName="p-6"
                missingNote={product ? "lg" : undefined}
              />
              {adInColumn && <DetailAd className="mx-auto mt-6" />}
            </div>

            <div className="min-w-0">
              <DetailProductHeader
                product={product}
                stuck={stuck}
                cheapestPrice={cheapestPrice}
                favouriteCount={favouriteCount}
              />
              <StoreOffers state={offers} />
            </div>

            {showAd && !desktop && <DetailAd className="mx-auto pt-1" />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
