import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const authCardVariants = cva("w-full max-w-[440px] rounded-[24px] border-line", {
  variants: {
    variant: {
      // The sign-in form on the blurred catalogue.
      form: "bg-white p-[clamp(24px,6vw,44px)] shadow-[0_20px_50px_rgba(26,26,26,0.06)]",
      // A short centred message on the plain page background.
      notice: "flex flex-col items-center p-[clamp(28px,6vw,44px)] text-center shadow-none",
    },
  },
  defaultVariants: { variant: "form" },
})

type AuthCardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof authCardVariants>

function AuthCard({ variant, className, ...props }: AuthCardProps) {
  return <Card className={cn(authCardVariants({ variant }), className)} {...props} />
}

export { AuthCard }
