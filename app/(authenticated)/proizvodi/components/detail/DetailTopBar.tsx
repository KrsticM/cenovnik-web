import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

export function DetailTopBar() {
  return (
    <div className="flex min-h-[60px] shrink-0 items-center gap-3 border-b border-line-soft py-2 pl-4 pr-3">
      <DialogClose asChild>
        <Button variant="pill" size="icon-lg" aria-label="Zatvori detalje proizvoda" className="h-11 w-11 shrink-0 sm:hidden">
          <span aria-hidden="true" className="block h-2.5 w-2.5 border-b-2 border-l-2 border-ink [transform:rotate(45deg)_translate(2px,-2px)]" />
        </Button>
      </DialogClose>
      <span className="flex-1 text-[15px] font-semibold text-ink">Detalji proizvoda</span>
      <DialogClose asChild>
        <Button
          variant="pill"
          size="icon-lg"
          aria-label="Zatvori detalje proizvoda"
          className="hidden text-[17px] font-normal text-ink-muted hover:text-sage-dark sm:inline-flex"
        >
          ×
        </Button>
      </DialogClose>
    </div>
  );
}
