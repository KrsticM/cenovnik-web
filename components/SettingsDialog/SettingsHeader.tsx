import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogTitle } from "@/components/ui/dialog";

const HEADER = "flex h-[68px] shrink-0 items-center border-b border-line-warm";
const ICON_BUTTON = "text-ink-muted hover:bg-paper hover:text-ink";

export function SettingsHeader() {
  return (
    <div className={`${HEADER} justify-between gap-3 pl-5 pr-4 sm:px-7`}>
      <DialogTitle className="text-xl font-semibold tracking-[-0.02em]">Podešavanja</DialogTitle>
      <Button asChild variant="ghost" size="icon-touch" className={`${ICON_BUTTON} -mr-2.5`}>
        <DialogClose aria-label="Zatvori podešavanja">
          <X className="!size-5" strokeWidth={2} />
        </DialogClose>
      </Button>
    </div>
  );
}

export function BackHeader({ disabled, onBack }: { disabled: boolean; onBack: () => void }) {
  return (
    <div className={`${HEADER} gap-2 px-3 sm:px-5`}>
      <Button type="button" variant="ghost" size="icon-touch" className={ICON_BUTTON} disabled={disabled} onClick={onBack} aria-label="Nazad na podešavanja">
        <ArrowLeft className="!size-5" strokeWidth={2} />
      </Button>
      <span className="text-[15px] font-medium text-ink-muted" aria-hidden="true">Podešavanja</span>
    </div>
  );
}
