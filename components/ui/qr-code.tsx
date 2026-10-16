"use client"

import { QRCodeSVG } from "qrcode.react"

import { cn } from "@/lib/utils"

interface QrCodeProps {
  value: string
  label: string
  className?: string
}

function QrCode({ value, label, className }: QrCodeProps) {
  return (
    <span className={cn("block shrink-0 rounded-[12px] border border-line bg-white p-2.5 text-ink", className)}>
      <QRCodeSVG value={value} size={90} level="M" title={label} fgColor="currentColor" bgColor="transparent" />
    </span>
  )
}

export { QrCode }
