import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Design (Claude Design) variants — palette tokens only.
        deal: "rounded-[8px] border-0 bg-rust px-2.5 py-[5px] text-[11px] uppercase tracking-[0.04em] text-white",
        best: "rounded-[7px] border-0 bg-sage-dark px-[9px] py-[3px] text-[11px] uppercase tracking-[0.04em] text-cream",
        public: "gap-1.5 rounded-[12px] border-0 bg-sage-tint px-2.5 py-1 text-xs text-sage-dark",
        count: "h-[26px] min-w-[26px] justify-center border-0 bg-sage-dark px-2 text-sm text-cream",
        "count-sm": "h-[22px] min-w-[22px] justify-center border-0 bg-sage-dark px-1.5 text-xs text-cream",
        list: "rounded-2xl border-line bg-paper px-3 py-1.5 text-[13px] font-medium text-ink",
        tag: "rounded-[6px] border-0 bg-sage-dark px-2 py-0.5 text-[11px] tracking-[0.03em] text-cream",
        discount: "rounded-[6px] border-0 bg-rust px-1.5 py-0.5 text-[11px] text-white",
        qty: "whitespace-nowrap rounded-[9px] border-0 bg-cream px-2.5 py-1 text-[13px] text-sage-dark",
        code: "select-all rounded-[5px] border-0 bg-sand px-1.5 py-0.5 font-mono text-xs font-normal text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
