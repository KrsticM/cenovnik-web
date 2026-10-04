import * as React from "react"

import { cn } from "@/lib/utils"

// Empty/error/system-state illustrations, all built from the logo's three descending bars.
type Variant =
  | "link-inactive"
  | "unavailable"
  | "error"
  | "no-markets"
  | "no-results"
  | "empty-list"
  | "not-in-markets"
  | "not-found"

const DASHED = "border-2 border-dashed border-stone"
const OUTLINE = "border-2 border-stone"

const BARS: Record<Exclude<Variant, "not-found">, { heights: number[]; fills: string[]; small?: boolean }> = {
  "link-inactive": { heights: [44, 30, 18], fills: [DASHED, DASHED, DASHED] },
  unavailable: { heights: [44, 30, 18], fills: ["bg-bar-idle", "bg-rust", "bg-bar-idle"] },
  error: { heights: [44, 30, 18], fills: ["bg-bar-idle", "bg-bar-idle", "bg-rust"] },
  "no-markets": { heights: [44, 30, 18], fills: [OUTLINE, OUTLINE, "bg-sage"] },
  "no-results": { heights: [44, 30, 18], fills: ["bg-bar-idle", "bg-bar-idle", "bg-bar-idle"] },
  "empty-list": { heights: [12, 12, 12], fills: ["bg-sage-mist", "bg-sage-mist", "bg-sage"] },
  "not-in-markets": { heights: [28, 19, 11], fills: ["bg-bar-idle", DASHED, "bg-bar-idle"], small: true },
}

interface StateIllustrationProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: Variant
}

function StateIllustration({ variant, className, ...props }: StateIllustrationProps) {
  if (variant === "not-found") {
    return (
      <span
        aria-hidden="true"
        className={cn("mx-auto flex h-20 w-20 items-end justify-center gap-[5px] rounded-[20px] bg-cream pb-5", className)}
        {...props}
      >
        {[30, 20, 12].map((h) => (
          <span key={h} className="block w-[9px] rounded-[5px] bg-cream-bar" style={{ height: h }} />
        ))}
      </span>
    )
  }

  const { heights, fills, small } = BARS[variant]
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex items-end justify-center",
        small ? "h-7 gap-1" : "h-11 gap-1.5",
        variant === "no-results" && "pr-2.5",
        className
      )}
      {...props}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn("block", small ? "w-2.5 rounded-[5px]" : "w-3.5 rounded-[7px]", fills[i])}
          style={{ height: h }}
        />
      ))}
      {variant === "no-results" && (
        <span className="absolute -right-1.5 -top-2 block h-6 w-6 rounded-full border-[3px] border-sage bg-white/70" />
      )}
    </span>
  )
}

export { StateIllustration }
