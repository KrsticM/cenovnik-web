import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/formatPrice"

const priceVariants = cva("whitespace-nowrap font-semibold", {
  variants: {
    size: {
      row: "text-[15px]",
      compare: "text-lg tracking-[-0.01em]",
      card: "text-[19px] tracking-[-0.01em]",
      total: "text-2xl tracking-[-0.02em]",
    },
    tone: {
      rust: "text-rust",
      ink: "text-ink",
    },
  },
  defaultVariants: { size: "card", tone: "rust" },
})

interface PriceProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof priceVariants> {
  value: number | null | undefined
}

// Formatted RSD amount in the design's price styles; renders "—" when there is no price.
function Price({ value, size, tone, className, ...props }: PriceProps) {
  return (
    <span className={cn(priceVariants({ size, tone }), className)} {...props}>
      {formatPrice(value)}
    </span>
  )
}

export { Price, priceVariants }
