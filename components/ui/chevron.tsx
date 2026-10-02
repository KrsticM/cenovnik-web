import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Border-drawn chevron that points down and flips up when its trigger is open. The trigger needs
// the `group/trigger` class; Radix sets data-state="open" on it (e.g. CollapsibleTrigger).
const chevronVariants = cva(
  "block shrink-0 border-b border-r border-current transition-transform group-data-[state=open]/trigger:-rotate-[135deg]",
  {
    variants: {
      size: {
        sm: "h-1.5 w-1.5 border-b-[1.5px] border-r-[1.5px] -translate-y-[3px] rotate-45 duration-150 group-data-[state=open]/trigger:-translate-y-px",
        md: "h-2 w-2 border-b-2 border-r-2 -translate-y-[3px] rotate-45 duration-[160ms] group-data-[state=open]/trigger:-translate-y-0.5",
      },
    },
    defaultVariants: { size: "sm" },
  }
)

function Chevron({
  size,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof chevronVariants>) {
  return <span aria-hidden="true" className={cn(chevronVariants({ size }), className)} {...props} />
}

export { Chevron, chevronVariants }
