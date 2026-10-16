"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

function InputOTP({ className, containerClassName, ...props }: React.ComponentProps<typeof OTPInput>) {
  return (
    <OTPInput
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center", className)} {...props} />
}

interface InputOTPSlotProps extends React.ComponentProps<"div"> {
  index: number
  // The sign-in look: separate rounded boxes instead of one joined field.
  boxed?: boolean
  invalid?: boolean
  muted?: boolean
}

function InputOTPSlot({ index, boxed, invalid, muted, className, ...props }: InputOTPSlotProps) {
  const { char, hasFakeCaret, isActive } = React.useContext(OTPInputContext).slots[index]

  return (
    <div
      data-active={isActive}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        boxed &&
          cn(
            "h-[60px] w-auto max-w-[56px] flex-1 rounded-[14px] border text-2xl font-semibold tabular-nums text-ink shadow-none transition-[border-color,box-shadow] duration-100 first:rounded-[14px] last:rounded-[14px]",
            "data-[active=true]:z-0 data-[active=true]:border-sage data-[active=true]:ring-[3px] data-[active=true]:ring-sage/18",
            invalid ? "border-rust" : "border-line",
            muted ? "bg-sand" : "bg-white"
          ),
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("block h-0.5 w-2 shrink-0 rounded-[1px] bg-stone", className)} {...props} />
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
