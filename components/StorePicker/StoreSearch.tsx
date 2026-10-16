import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RingIcon } from "@/components/ui/ring-icon";
import { cn } from "@/lib/utils";

interface StoreSearchProps {
  value: string;
  onChange: (value: string) => void;
  onStart: () => void;
  // The phone's full-dialog search: the field sits at the top and "Otkaži" leaves it.
  searchMode: boolean;
  onCancel: () => void;
}

export function StoreSearch({ value, onChange, onStart, searchMode, onCancel }: StoreSearchProps) {
  return (
    <div className={cn("flex items-center gap-2", searchMode ? "mt-0" : "mt-6")}>
      <div className="relative flex min-w-0 flex-auto items-center">
        <RingIcon tone="ink-stone" className="pointer-events-none absolute left-[18px] size-3.5" />
        <Input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onPointerDown={onStart}
          aria-label="Pretraži markete po nazivu, adresi ili mestu"
          placeholder="Pretraži po nazivu, adresi ili mestu"
          className="h-12 rounded-full border-line bg-white pl-11 pr-[18px] text-base text-ink focus-visible:border-sage focus-visible:ring-[3px] focus-visible:ring-sage/18 focus-visible:ring-offset-0 md:text-base"
        />
      </div>
      {searchMode && (
        <Button type="button" variant="ghost-sage" size="link" onClick={onCancel} className="h-11 shrink-0 px-2 text-[15px] font-medium">
          Otkaži
        </Button>
      )}
    </div>
  );
}
