import { cn } from "@/lib/utils"

const TONES = {
  muted: "border-ink-muted",
  soft: "border-ink-soft",
  stone: "border-stone",
  "ink-stone": "border-ink-stone",
}

interface RingIconProps {
  tone?: keyof typeof TONES
  className?: string
}

function RingIcon({ tone = "muted", className }: RingIconProps) {
  return <span aria-hidden="true" className={cn("block rounded-full border-2", TONES[tone], className)} />
}

export { RingIcon }
