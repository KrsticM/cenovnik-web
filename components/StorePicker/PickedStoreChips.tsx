import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PickedChip } from "./storePickerModel";

interface PickedStoreChipsProps {
  chips: PickedChip[];
  onRemove: (storeId: string) => void;
}

export function PickedStoreChips({ chips, onRemove }: PickedStoreChipsProps) {
  if (chips.length === 0) return null;
  return (
    <div aria-label="Izabrani marketi" className="mt-3.5 flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <Button
          key={chip.id}
          variant="chip"
          aria-label={`Ukloni ${chip.label}`}
          onClick={() => onRemove(chip.id)}
          className="h-8 max-w-full gap-1.5 rounded-2xl bg-sage-wash pl-3 pr-2 text-[13px] font-medium animate-[fadeUp_150ms_ease_both] hover:bg-sage-wash-dark focus-visible:ring-offset-[2px]"
        >
          <span className="truncate">{chip.label}</span>
          <X aria-hidden="true" className="!size-3.5" />
        </Button>
      ))}
    </div>
  );
}
