"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MyMarketsDialogProps {
  open: boolean;
  dismissable: boolean;
  onClose: () => void;
  onRestoreFocus: () => void;
  children: ReactNode;
}

const keepOpen = (event: Event) => event.preventDefault();

export function MyMarketsDialog({ open, dismissable, onClose, onRestoreFocus, children }: MyMarketsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismissable && onClose()}>
      <DialogContent
        hideClose={!dismissable}
        closeLabel="Zatvori"
        aria-describedby={undefined}
        onEscapeKeyDown={dismissable ? undefined : keepOpen}
        onPointerDownOutside={dismissable ? undefined : keepOpen}
        onInteractOutside={dismissable ? undefined : keepOpen}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
        overlayClassName="z-[70] bg-scrim data-[state=open]:animate-[fadeIn_180ms_ease_both]"
        className="z-[70] flex flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-modal data-[state=open]:animate-[dropIn_200ms_ease_both] inset-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 rounded-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:w-[min(640px,calc(100%-48px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
      >
        <div className="overflow-y-auto p-[clamp(24px,6vw,44px)]">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
