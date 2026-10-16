"use client"

import Image from "next/image"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { AppleIcon, GooglePlayIcon } from "@/components/ui/provider-icon"

// Official artwork, unmodified and served from /public; Apple has no Serbian badge, so both stores use the English one.
const STORES = {
  app_store: {
    badge: "/badges/app-store-badge.svg",
    width: 120,
    height: 40,
    alt: "Preuzmi u App Store-u",
    label: "Preuzmi eCenovnik u App Store-u, otvara se u novoj kartici",
    text: "Preuzmi u App Store-u",
  },
  google_play: {
    badge: "/badges/google-play-badge.png",
    width: 646,
    height: 250,
    alt: "Preuzmi u Google Play-u",
    label: "Preuzmi eCenovnik u Google Play-u, otvara se u novoj kartici",
    text: "Preuzmi u Google Play-u",
  },
}

// The Google Play image has built-in padding, so its negative margin evens out the row.
const IMAGE = {
  app_store: "h-12 sm:h-11",
  google_play: "m-[-11px_-9px] h-[71px] sm:m-[-10px_-8px] sm:h-[65px]",
}

interface StoreBadgeProps {
  store: keyof typeof STORES
  href: string
}

// The official badge, or a dark button with the store's name when the image cannot be loaded.
function StoreBadge({ store, href }: StoreBadgeProps) {
  const [failed, setFailed] = React.useState(false)
  const { badge, width, height, alt, label, text } = STORES[store]
  const Icon = store === "app_store" ? AppleIcon : GooglePlayIcon

  if (failed) {
    return (
      <Button asChild variant="dark" size="action" className="rounded-[12px] font-medium text-white focus-visible:ring-offset-white">
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
          {store === "app_store" ? <Icon mono /> : <Icon />}
          <span>{text}</span>
        </a>
      </Button>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <Image src={badge} alt={alt} width={width} height={height} unoptimized onError={() => setFailed(true)} className={`block w-auto ${IMAGE[store]}`} />
    </a>
  )
}

export { StoreBadge }
