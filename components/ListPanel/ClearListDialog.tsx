"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { articleCount } from "@/lib/formatPrice";

interface ClearListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCount: number;
  listName: string;
  onConfirm: () => void;
}

const buttonBase = "h-11 rounded-[22px] px-[18px] text-sm font-medium shadow-none transition-colors";

export function ClearListDialog({ open, onOpenChange, itemCount, listName, onConfirm }: ClearListDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName="z-[80] data-[state=open]:animate-[fadeIn_160ms_ease_both] bg-scrim"
        className="z-[80] block w-[calc(100%-32px)] max-w-[400px] data-[state=open]:animate-[qtyIn_180ms_ease_both] rounded-[18px] border-0 bg-white p-6 shadow-modal sm:rounded-[18px]"
      >
        <AlertDialogTitle className="text-lg font-semibold tracking-[-0.01em] text-ink">
          Želiš da isprazniš listu?
        </AlertDialogTitle>
        <AlertDialogDescription className="mt-2 text-sm leading-[1.55] text-ink-muted">
          Uklonićeš {articleCount(itemCount)} sa liste „{listName}“.
          Ova akcija se ne može poništiti.
        </AlertDialogDescription>
        <AlertDialogFooter className="mt-6 flex-row flex-wrap justify-end gap-2.5 sm:space-x-0">
          <AlertDialogCancel className={`${buttonBase} mt-0 border border-line bg-white text-ink hover:border-sage hover:bg-white`}>
            Otkaži
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={`${buttonBase} bg-rust text-white hover:bg-rust-dark`}>
            Isprazni listu
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
