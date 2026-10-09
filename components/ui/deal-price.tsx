import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import { Price, priceVariants } from "@/components/ui/price"

interface DealPriceProps {
  price: number
  regularPrice?: number | null
  discountPct?: number
  upTo?: boolean
  size?: VariantProps<typeof priceVariants>["size"]
  priceClassName?: string
  layout?: "inline" | "below" | "stacked"
}

function DealPrice({
  price,
  regularPrice,
  discountPct,
  upTo = false,
  size,
  priceClassName,
  layout = "inline",
}: DealPriceProps) {
  const regular =
    regularPrice != null && regularPrice > price ? (
      <Price
        value={regularPrice}
        tone="muted"
        label="Redovna cena"
        className={layout === "stacked" ? "text-xs" : undefined}
      />
    ) : null
  const badge = discountPct ? (
    <Badge variant="discount">
      {upTo && "do "}−{discountPct}%
    </Badge>
  ) : null
  const current = <Price value={price} size={size} className={priceClassName} />

  if (layout === "stacked") {
    return (
      <div className="flex shrink-0 flex-col items-end gap-[3px]">
        {(regular || badge) && (
          <span className="flex items-center gap-1.5">
            {regular}
            {badge}
          </span>
        )}
        {current}
      </div>
    )
  }

  if (layout === "below") {
    return (
      <span className="flex flex-col items-start gap-2">
        {current}
        {(regular || badge) && (
          <span className="flex items-baseline gap-2">
            {regular}
            {badge}
          </span>
        )}
      </span>
    )
  }

  return (
    <span className="flex flex-wrap items-baseline gap-2">
      {current}
      {regular}
      {badge}
    </span>
  )
}

export { DealPrice }
