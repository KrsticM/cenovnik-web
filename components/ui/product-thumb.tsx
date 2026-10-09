"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { getProductImageUrl } from "@/lib/productImageUrl"

interface ProductThumbProps extends React.HTMLAttributes<HTMLDivElement> {
  barcode: string | null | undefined
  hasImage: boolean
  alt: string
  imgClassName?: string
  size?: "thumb" | "full"
}

// Product photo with the design's striped placeholder when there is no image.
const ProductThumb = React.forwardRef<HTMLDivElement, ProductThumbProps>(
  ({ barcode, hasImage, alt, className, imgClassName, size = "thumb", children, ...props }, ref) => {
    const showImage = hasImage && !!barcode
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
              else e.currentTarget.style.display = "none"
            }}
          />
        )}
        {children}
      </div>
    )
  }
)
ProductThumb.displayName = "ProductThumb"

export { ProductThumb }
