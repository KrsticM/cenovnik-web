import { cn } from "@/lib/utils"

const SIZES = {
  md: { bar: "w-2.5 rounded-[5px]", gap: "gap-1", heights: ["h-[30px]", "h-5", "h-3"] },
  lg: { bar: "w-[15px] rounded-[8px]", gap: "gap-1.5", heights: ["h-12", "h-8", "h-[19px]"] },
}

function BrandBars({ size = "lg", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size]
  return (
    <span aria-hidden="true" className={cn("flex items-end", s.gap, className)}>
      <span className={cn("block bg-terracotta", s.bar, s.heights[0])} />
      <span className={cn("block bg-stone", s.bar, s.heights[1])} />
      <span className={cn("block bg-sage", s.bar, s.heights[2])} />
    </span>
  )
}

export { BrandBars }
