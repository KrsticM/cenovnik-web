import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const headingVariants = cva("font-semibold text-ink", {
  variants: {
    size: {
      brand: "text-[32px] leading-[1.1] tracking-[-0.03em]",
      page: "text-[28px] leading-[1.15] tracking-[-0.025em]",
      status: "text-[26px] leading-[1.2] tracking-[-0.025em]",
    },
  },
  defaultVariants: { size: "page" },
})

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  // A dialog passes its title component here, so the heading names the dialog.
  as?: React.ElementType
  ref?: React.Ref<HTMLHeadingElement>
}

function Heading({ as: Tag = "h1", size, className, ...props }: HeadingProps) {
  return <Tag className={cn(headingVariants({ size }), className)} {...props} />
}

const textVariants = cva("", {
  variants: {
    size: {
      lead: "text-base leading-normal text-pretty",
      plain: "text-base",
      small: "text-sm leading-normal text-pretty",
      caption: "text-[13px] leading-normal text-pretty",
      "product-name": "line-clamp-2 min-h-[38px] text-sm font-medium leading-[1.35]",
    },
    tone: {
      muted: "text-ink-muted",
      ink: "text-ink",
    },
  },
  defaultVariants: { size: "lead", tone: "muted" },
})

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof textVariants>

function Text({ size, tone, className, ...props }: TextProps) {
  return <p className={cn(textVariants({ size, tone }), className)} {...props} />
}

function Strong({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <strong className={cn("font-semibold", className)} {...props} />
}

export { Heading, Strong, Text }
