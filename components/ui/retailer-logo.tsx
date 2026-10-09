import Image from "next/image"

import { cn } from "@/lib/utils"

interface RetailerLogoProps {
  name: string
  src: string | null
  className?: string
}

// The initial stays underneath, so a chain without a logo still gets a tile.
function RetailerLogo({ name, src, className }: RetailerLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-sand text-base font-semibold text-ink-stone",
        className
      )}
    >
      {name.charAt(0)}
      {src && <Image src={src} alt="" fill sizes="40px" className="object-contain" />}
    </span>
  )
}

export { RetailerLogo }
