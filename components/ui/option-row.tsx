"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

// A selectable row (checkbox semantics) with a round tick at the end; the content goes in children.
function OptionRow({ className, children, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "group flex min-h-[60px] w-full cursor-pointer items-center gap-3.5 border-t border-line-soft bg-transparent py-2 text-left outline-none",
        "focus-visible:rounded-[10px] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-stone bg-white transition-colors duration-150 group-data-[state=checked]:border-sage-dark group-data-[state=checked]:bg-sage-dark group-data-[state=checked]:text-cream"
      >
        <CheckboxPrimitive.Indicator>
          <Check strokeWidth={3} className="size-3" />
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  )
}

export { OptionRow }
