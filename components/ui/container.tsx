import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-[720px]",
      md: "max-w-[1040px]",
      lg: "max-w-[1280px]",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size, className }))}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container, containerVariants }
