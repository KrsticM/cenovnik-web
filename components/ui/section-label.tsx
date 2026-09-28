import * as React from "react"

import { cn } from "@/lib/utils"

// Small uppercase heading used for filter groups (Prodavnice, Cena, Ponuda).
function SectionLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-xs font-semibold uppercase tracking-[0.07em] text-ink-muted", className)}
      {...props}
    />
  )
}

export { SectionLabel }
