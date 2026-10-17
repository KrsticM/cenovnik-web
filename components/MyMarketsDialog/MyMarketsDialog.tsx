"use client";

import type { ReactNode } from "react";
import { ModalDialog } from "@/components/ui/modal-dialog";

interface MyMarketsDialogProps {
  open: boolean;
  dismissable: boolean;
  onClose: () => void;
  onRestoreFocus: () => void;
  children: ReactNode;
}

export function MyMarketsDialog({ open, dismissable, onClose, onRestoreFocus, children }: MyMarketsDialogProps) {
  return (
    <ModalDialog
      open={open}
      dismissable={dismissable}
      onClose={onClose}
      onRestoreFocus={onRestoreFocus}
      hideClose={!dismissable}
      className="sm:max-h-[calc(100dvh-48px)] sm:w-[min(640px,calc(100%-48px))]"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-[clamp(24px,6vw,44px)] pb-[calc(clamp(24px,6vw,44px)+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>
    </ModalDialog>
  );
}
