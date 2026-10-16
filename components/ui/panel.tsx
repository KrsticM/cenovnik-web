import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const panelVariants = cva("flex text-sm", {
  variants: {
    tone: {
      premium: "border border-gold-border bg-gold-wash",
      standard: "border border-sage-wash-line bg-sage-wash",
      neutral: "border border-line-warm bg-ivory",
      // A lighter box that sits inside another panel.
      note: "bg-white/70",
      danger: "border border-rust-border bg-rust-tint",
    },
    size: {
      card: "rounded-2xl px-5 py-[18px]",
      compact: "rounded-[12px] px-3.5 py-3",
      roomy: "rounded-[12px] p-4",
    },
  },
  defaultVariants: { tone: "note", size: "compact" },
})

type PanelProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof panelVariants>

// A tinted box for a status or a notice; the caller sets role, direction and gap.
function Panel({ tone, size, className, ...props }: PanelProps) {
  return <div className={cn(panelVariants({ tone, size }), className)} {...props} />
}

export { Panel }
