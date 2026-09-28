"use client";

import { ActiveFilterChip } from "../hooks/useProductFilters";
import { Button } from "@/components/ui/button";

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onClear: () => void;
}

export function ActiveFilterChips({ chips, onClear }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div aria-label="Aktivni filteri" className="-mt-2 mb-5 flex flex-wrap items-center gap-2 lg:hidden">
      {chips.map((chip) => (
        <Button
          key={chip.key}
          variant="chip"
          onClick={chip.remove}
          aria-label={chip.ariaLabel}
          className="h-[34px] rounded-[17px] pl-3.5 pr-2.5 text-[13px]"
        >
          {chip.label}
          <span aria-hidden="true" className="text-[15px] leading-none">×</span>
        </Button>
      ))}
      <Button variant="underline" onClick={onClear} className="h-[34px] px-2 text-[13px] hover:text-sage-dark">
        Očisti sve
      </Button>
    </div>
  );
}
