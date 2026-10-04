"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "@/lib/utils"

const CheckRow = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "group flex w-full cursor-pointer items-center gap-3.5 bg-transparent px-card text-left outline-none",
      "min-h-[72px] border-b border-line-soft py-3 hover:bg-paper-warm focus-visible:bg-paper-warm",
      "data-[state=checked]:min-h-16 data-[state=checked]:border-b-0 data-[state=checked]:border-t data-[state=checked]:border-t-[#efede8] data-[state=checked]:py-2.5 data-[state=checked]:hover:bg-[#f6f4ef] data-[state=checked]:focus-visible:bg-[#f6f4ef]",
      "focus-visible:shadow-[inset_3px_0_0_var(--color-sage)]",
      className
    )}
    {...props}
  >
    <span
      aria-hidden="true"
      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] border-2 border-toggle-off bg-white group-data-[state=checked]:border-0 group-data-[state=checked]:bg-sage-dark"
    >
      <CheckboxPrimitive.Indicator asChild>
        <span className="block h-[11px] w-1.5 border-b-2 border-r-2 border-cream [transform:rotate(45deg)_translate(-1px,-1px)]" />
      </CheckboxPrimitive.Indicator>
    </span>
    {children}
  </CheckboxPrimitive.Root>
))
CheckRow.displayName = "CheckRow"

export { CheckRow }
