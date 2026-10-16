import * as React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// The sign-in form on the blurred catalogue.
function AuthCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        "w-full max-w-[440px] rounded-[24px] border-line bg-white p-[clamp(24px,6vw,44px)] shadow-[0_20px_50px_rgba(26,26,26,0.06)]",
        className
      )}
      {...props}
    />
  )
}

export { AuthCard }
