import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Design (Claude Design) variants — palette tokens only.
        sage: "bg-sage-dark text-cream hover:bg-sage-darker",
        pill: "border border-line bg-white text-ink hover:border-sage",
        "pill-muted": "border border-line bg-white text-ink-muted hover:border-rust hover:text-rust",
        cream: "bg-cream font-semibold text-ink",
        chip: "border border-sage bg-sage-tint text-sage-dark",
        underline: "text-sage-dark underline underline-offset-2 hover:text-rust",
        "ghost-muted": "font-normal text-ink-muted hover:bg-paper hover:text-rust",
        "ghost-clear": "text-ink-muted hover:bg-sand hover:text-ink",
        "on-sage": "font-semibold text-cream hover:bg-cream/18",
        "on-sage-remove": "font-normal bg-cream/16 text-cream hover:bg-rust",
        "on-cream": "font-semibold text-sage-dark hover:bg-sage/14",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Design sizes: pills are fully rounded, icons are circles.
        "pill-sm": "h-9 rounded-full px-3.5 text-[13px]",
        pill: "h-[42px] rounded-full px-4",
        "pill-md": "h-11 rounded-full px-5",
        "pill-lg": "h-12 rounded-full px-[18px] text-[15px]",
        "pill-xl": "h-[52px] rounded-full px-7 text-base",
        text: "h-auto p-0",
        "icon-xs": "h-[26px] w-[26px] rounded-full p-0",
        "icon-sm": "h-7 w-7 rounded-full p-0",
        "icon-md": "h-9 w-9 rounded-full p-0",
        "icon-lg": "h-10 w-10 rounded-full p-0",
        "icon-xl": "h-12 w-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
