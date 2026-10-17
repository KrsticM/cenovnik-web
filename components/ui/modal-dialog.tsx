"use client"

import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog"
import { useVisualViewportVars } from "@/hooks/useVisualViewportVars"
import { cn } from "@/lib/utils"

interface ModalDialogProps {
  open: boolean
  // false: the dialog cannot be closed (Escape, outside click, the X) until the caller allows it.
  dismissable?: boolean
  onClose: () => void
  // Escape normally closes; give this to handle it differently (e.g. go back a step).
  onEscape?: () => void
  onRestoreFocus: () => void
  hideClose?: boolean
  // Read by screen readers only; leave out when the content explains itself.
  description?: string
  className?: string
  children: ReactNode
}

const keepOpen = (event: Event) => event.preventDefault()

// Full screen on a phone (following the visible area, so the on-screen keyboard never covers its bottom), a centred card from `sm`.
// Width and height limits come from `className`.
function ModalDialog({
  open,
  dismissable = true,
  onClose,
  onEscape,
  onRestoreFocus,
  hideClose = false,
  description,
  className,
  children,
}: ModalDialogProps) {
  useVisualViewportVars(open)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismissable && onClose()}>
      <DialogContent
        hideClose={hideClose}
        closeLabel="Zatvori"
        {...(description ? {} : { "aria-describedby": undefined })}
        onEscapeKeyDown={(event) => {
          if (!dismissable) return keepOpen(event)
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
        }}
        onPointerDownOutside={dismissable ? undefined : keepOpen}
        onInteractOutside={dismissable ? undefined : keepOpen}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onRestoreFocus()
        }}
        overlayClassName="z-[70] bg-scrim data-[state=open]:animate-[fadeIn_160ms_ease_both]"
        className={cn(
          "z-[70] flex flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-modal data-[state=open]:animate-[dropIn_200ms_ease_both]",
          "inset-x-0 bottom-auto top-[var(--vvt,0px)] h-[var(--vvh,100dvh)] w-full max-w-none translate-x-0 translate-y-0 rounded-none",
          "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]",
          "sm:max-h-[calc(100dvh-64px)] sm:w-[min(600px,calc(100%-48px))]",
          className
        )}
      >
        {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
        {children}
      </DialogContent>
    </Dialog>
  )
}

export { ModalDialog }
