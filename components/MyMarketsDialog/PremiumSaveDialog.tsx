"use client";

import { useEffect, useRef } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface PremiumSaveDialogProps {
  open: boolean;
  // false while the picker cannot be left: then nothing is saved yet and prices need the picks.
  dismissable: boolean;
  saving: boolean;
  failed: boolean;
  onSave: () => void;
  onStay: () => void;
  onRestoreFocus: () => void;
}

// Asked when the Premium button is pressed with picks that are not saved yet, so they are not lost silently.
export function PremiumSaveDialog({ open, dismissable, saving, failed, onSave, onStay, onRestoreFocus }: PremiumSaveDialogProps) {
  const saveRef = useRef<HTMLButtonElement>(null);

  // A failed save leaves the disabled button without focus; bring it back for the retry.
  useEffect(() => {
    if (failed && !saving) saveRef.current?.focus();
  }, [failed, saving]);

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !saving && onStay()}>
      <AlertDialogContent
        onOverlayClick={saving ? undefined : onStay}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          saveRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
        overlayClassName="z-[80] bg-scrim data-[state=open]:animate-[fadeIn_160ms_ease_both]"
        className={[
          "z-[80] flex flex-col gap-5 border-0 bg-white shadow-modal data-[state=open]:animate-[dropIn_200ms_ease_both]",
          "inset-x-0 bottom-0 top-auto max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-[24px] p-5 pb-[calc(20px+env(safe-area-inset-bottom))]",
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px] sm:p-7",
        ].join(" ")}
      >
        <div className="flex flex-col gap-2">
          <AlertDialogTitle className="text-xl font-semibold leading-[1.3] tracking-[-0.02em] text-ink text-pretty">
            Sačuvati izabrane markete?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] leading-normal text-ink-muted text-pretty">
            {dismissable
              ? "Pre nego što pređeš na Premium članstvo, sačuvaj izabrane markete da se izmene ne bi izgubile."
              : "Pre nego što pređeš na Premium članstvo, sačuvaj izabrane markete. Bez njih ne možemo da ti prikažemo cene."}
          </AlertDialogDescription>
          {failed && (
            <p role="alert" className="text-sm font-semibold text-rust">
              Nismo uspeli da sačuvamo markete. Pokušaj ponovo.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button ref={saveRef} type="button" variant="sage" size="cta" onClick={onSave} disabled={saving} aria-busy={saving} className="gap-2.5">
            {saving && <Spinner tone="cream" />}
            {saving ? "Čuvamo…" : "Sačuvaj i nastavi"}
          </Button>
          <Button type="button" variant="ghost-sage" size="pill-lg" onClick={onStay} disabled={saving} className="h-12 text-[15px] font-medium hover:underline">
            Nazad na izbor marketa
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
