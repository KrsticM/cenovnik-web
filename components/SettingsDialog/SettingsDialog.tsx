"use client";

import type { ReactNode } from "react";
import { ModalDialog } from "@/components/ui/modal-dialog";

interface SettingsDialogProps {
  open: boolean;
  // While the account is being deleted nothing may close the dialog.
  locked: boolean;
  onClose: () => void;
  // Escape in the delete step goes back one step instead of closing.
  onEscape?: () => void;
  onRestoreFocus: () => void;
  children: ReactNode;
}

export function SettingsDialog({ open, locked, onClose, onEscape, onRestoreFocus, children }: SettingsDialogProps) {
  return (
    <ModalDialog
      open={open}
      dismissable={!locked}
      onClose={onClose}
      onEscape={onEscape}
      onRestoreFocus={onRestoreFocus}
      hideClose
      description="Pretplata, nalog i pomoć"
    >
      {children}
    </ModalDialog>
  );
}
