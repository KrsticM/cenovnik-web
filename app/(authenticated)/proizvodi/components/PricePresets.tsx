"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PRICE_PRESETS } from "../hooks/useProductFilters";

interface PricePresetsProps {
  value: number | null;
  onToggle: (index: number) => void;
}

export function PricePresets({ value, onToggle }: PricePresetsProps) {
  return (
    <ToggleGroup
      type="single"
      aria-label="Cena"
      value={value === null ? "" : String(value)}
      onValueChange={(next) => onToggle(next === "" ? value ?? 0 : Number(next))}
      className="flex-wrap justify-start gap-1.5"
    >
      {PRICE_PRESETS.map((preset, index) => (
        <ToggleGroupItem
          key={preset.label}
          value={String(index)}
          className="h-9 whitespace-nowrap rounded-[18px] border border-line bg-white px-3.5 text-[13px] font-normal text-ink shadow-none hover:border-sage hover:bg-white hover:text-ink data-[state=on]:border-sage data-[state=on]:bg-sage-tint data-[state=on]:font-semibold data-[state=on]:text-sage-dark"
        >
          {preset.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
