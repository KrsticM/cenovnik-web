import { cn } from "@/lib/utils"

const TONES = {
  sage: "border-line border-t-sage",
  dark: "border-line border-t-sage-dark",
  cream: "border-cream/35 border-t-cream",
}

const SIZES = { 14: "size-3.5", 16: "size-4" }

interface SpinnerProps {
  size?: keyof typeof SIZES
  tone?: keyof typeof TONES
  className?: string
}

function Spinner({ size = 16, tone = "sage", className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("block shrink-0 animate-[spin_700ms_linear_infinite] rounded-full border-2", SIZES[size], TONES[tone], className)}
    />
  )
}

export { Spinner }
