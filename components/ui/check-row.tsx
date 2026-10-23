"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "@/lib/utils"

// Same box in a ticked row and on its own, so the owner's list and the shared list tick alike.
function TickMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] border-2 border-toggle-off bg-white group-data-[state=checked]:border-0 group-data-[state=checked]:bg-sage-dark"
    >
      <CheckboxPrimitive.Indicator asChild>
        <span className="block h-[11px] w-1.5 border-b-2 border-r-2 border-cream [transform:rotate(45deg)_translate(-1px,-1px)]" />
      </CheckboxPrimitive.Indicator>
    </span>
  )
}

const CheckRow = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "group flex w-full cursor-pointer items-center gap-3.5 bg-transparent px-card text-left outline-none",
      "min-h-[72px] border-b border-line-soft py-3 hover:bg-paper-warm focus-visible:bg-paper-warm",
      "data-[state=checked]:min-h-16 data-[state=checked]:border-b-0 data-[state=checked]:border-t data-[state=checked]:border-t-[#efede8] data-[state=checked]:py-2.5 data-[state=checked]:hover:bg-oat data-[state=checked]:focus-visible:bg-oat",
      "focus-visible:shadow-[inset_3px_0_0_var(--color-sage)]",
      className
    )}
    {...props}
  >
    <TickMark />
    {children}
  </CheckboxPrimitive.Root>
))
CheckRow.displayName = "CheckRow"

// The box alone with a 44px touch target, for rows that hold other controls.
const TickBox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "group flex size-11 cursor-pointer items-center justify-center rounded-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-sage",
      className
    )}
    {...props}
  >
    <TickMark />
  </CheckboxPrimitive.Root>
))
TickBox.displayName = "TickBox"

export { CheckRow, TickBox }
