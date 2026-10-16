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
      <div className="overflow-y-auto p-[clamp(24px,6vw,44px)]">
        {children}
      </div>
    </ModalDialog>
  );
}
