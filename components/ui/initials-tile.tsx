import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Square tile with a chain's initials, standing in for a retailer logo.
const initialsTileVariants = cva(
  "flex shrink-0 items-center justify-center font-semibold",
  {
    variants: {
      size: {
        md: "h-11 w-11 rounded-[10px] text-[13px]",
        sm: "h-9 w-9 rounded-[9px] text-xs",
      },
      tone: {
        sage: "bg-sand text-sage-dark",
        muted: "bg-tile-muted text-ink-muted",
      },
    },
    defaultVariants: { size: "md", tone: "sage" },
  }
)

function InitialsTile({
  size,
  tone,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof initialsTileVariants>) {
  return <span aria-hidden="true" className={cn(initialsTileVariants({ size, tone }), className)} {...props} />
}

export { InitialsTile, initialsTileVariants }
