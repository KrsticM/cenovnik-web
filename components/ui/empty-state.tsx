import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { StateIllustration, type StateIllustrationVariant } from "@/components/ui/state-illustration"

const emptyStateVariants = cva("text-center", {
  variants: {
    variant: {
      plain: "px-9 py-20",
      card: "rounded-2xl border border-line bg-white px-6 py-[88px]",
      dashed: "rounded-[14px] border border-dashed border-toggle-off px-4 py-6",
    },
  },
  defaultVariants: { variant: "plain" },
})

const TITLE_SIZE = { lg: "text-[17px]", md: "text-base", sm: "text-[15px]" }
const TITLE_GAP = { lg: "mt-[22px]", md: "mt-[22px]", sm: "mt-3" }

interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  illustration?: StateIllustrationVariant
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  size?: keyof typeof TITLE_SIZE
  className?: string
  titleClassName?: string
}

function EmptyState({
  illustration,
  title,
  description,
  action,
  variant,
  size = "lg",
  className,
  titleClassName,
}: EmptyStateProps) {
  return (
    <div className={cn(emptyStateVariants({ variant }), className)}>
      {illustration && <StateIllustration variant={illustration} />}
      <p className={cn("font-medium text-ink", TITLE_SIZE[size], illustration && TITLE_GAP[size], titleClassName)}>
        {title}
      </p>
      {description && <p className="mt-1.5 text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export { EmptyState, emptyStateVariants }
