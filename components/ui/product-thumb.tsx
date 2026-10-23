"use client"

import * as React from "react"

import { CameraOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { getProductImageUrl } from "@/lib/productImageUrl"

interface ProductThumbProps extends React.HTMLAttributes<HTMLDivElement> {
  barcode: string | null | undefined
  hasImage: boolean
  alt: string
  imgClassName?: string
  size?: "thumb" | "full"
  // Card and detail say there is no photo; small thumbs keep the stripes.
  missingNote?: "md" | "lg"
}

const ProductThumb = React.forwardRef<HTMLDivElement, ProductThumbProps>(
  ({ barcode, hasImage, alt, className, imgClassName, size = "thumb", missingNote, children, ...props }, ref) => {
    // Keyed by barcode, so a reused thumb tries the next product's photo again.
    const [failedBarcode, setFailedBarcode] = React.useState<string | null>(null)
    const showImage = hasImage && !!barcode && failedBarcode !== barcode
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", showImage ? "bg-white" : "stripes", className)}
        {...props}
      >
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element -- CDN thumbs are already sized; next/image would need a loader.
          <img
            src={getProductImageUrl(barcode!, size)}
            alt={alt}
            loading={size === "full" ? "eager" : "lazy"}
            className={cn("h-full w-full object-contain", imgClassName)}
            onError={(e) => {
              const thumb = getProductImageUrl(barcode!, "thumb")
              if (size === "full" && !e.currentTarget.src.endsWith(thumb)) e.currentTarget.src = thumb
              else setFailedBarcode(barcode!)
            }}
          />
        )}
        {!showImage && missingNote && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-oat p-4 text-center">
            <CameraOff aria-hidden="true" strokeWidth={1.6} className={cn("text-ink-stone", missingNote === "lg" ? "size-9" : "size-7")} />
            <span className={cn("max-w-[220px] leading-[1.4] text-ink-muted text-pretty", missingNote === "lg" ? "text-[15px]" : "text-[13px]")}>
              Trenutno nemamo fotografiju ovog proizvoda
            </span>
          </span>
        )}
        {children}
      </div>
    )
  }
)
ProductThumb.displayName = "ProductThumb"

export { ProductThumb }
