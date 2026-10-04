import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
}

function ProgressBar({ value, className, ...props }: ProgressBarProps) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100)
  return (
    <div aria-hidden="true" className={cn("h-1.5 overflow-hidden rounded-[3px] bg-sand", className)} {...props}>
      <div className="h-full rounded-[3px] bg-sage transition-[width] duration-[240ms] ease-out" style={{ width: `${pct}%` }} />
    </div>
  )
}

export { ProgressBar }
