import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

interface InitialsTileProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof initialsTileVariants> {
  name: string
}

function InitialsTile({ name, size, tone, className, ...props }: InitialsTileProps) {
  return (
    <span aria-hidden="true" className={cn(initialsTileVariants({ size, tone }), className)} {...props}>
      {initials(name)}
    </span>
  )
}

export { InitialsTile, initialsTileVariants }
