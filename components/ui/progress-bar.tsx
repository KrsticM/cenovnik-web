import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const trackVariants = cva("h-1.5 overflow-hidden rounded-[3px]", {
  variants: { tone: { sage: "bg-sand", trial: "bg-gold-border" } },
  defaultVariants: { tone: "sage" },
})

const fillVariants = cva("h-full rounded-[3px] transition-[width] duration-[240ms] ease-out", {
  variants: { tone: { sage: "bg-sage", trial: "bg-terracotta" } },
  defaultVariants: { tone: "sage" },
})

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof trackVariants> {
  value: number
}

function ProgressBar({ value, tone, className, ...props }: ProgressBarProps) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100)
  return (
    <div aria-hidden="true" className={cn(trackVariants({ tone }), className)} {...props}>
      <div className={fillVariants({ tone })} style={{ width: `${pct}%` }} />
    </div>
  )
}

export { ProgressBar }
