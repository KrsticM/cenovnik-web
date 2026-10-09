import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const checkCircleVariants = cva("flex shrink-0 items-center justify-center rounded-full bg-cream text-sage-dark", {
  variants: { size: { sm: "h-5 w-5", lg: "h-14 w-14" } },
  defaultVariants: { size: "sm" },
})

const ICON = { sm: { className: "size-2.5", strokeWidth: 3 }, lg: { className: "size-[22px]", strokeWidth: 2.6 } }

interface CheckCircleProps extends VariantProps<typeof checkCircleVariants> {
  className?: string
}

// Decorative confirmation mark; pair it with text that says what succeeded.
function CheckCircle({ size = "sm", className }: CheckCircleProps) {
  const icon = ICON[size ?? "sm"]
  return (
    <span aria-hidden="true" className={cn(checkCircleVariants({ size }), className)}>
      <Check strokeWidth={icon.strokeWidth} className={icon.className} />
    </span>
  )
}

export { CheckCircle }
