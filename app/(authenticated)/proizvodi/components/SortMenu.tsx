"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortKey } from "../hooks/useProductFilters";

interface SortMenuProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Preporučeno" },
  { value: "price_asc", label: "Cena: niža prvo" },
  { value: "price_desc", label: "Cena: viša prvo" },
  { value: "name", label: "Naziv A–Ž" },
];

export function SortMenu({ value, onChange }: SortMenuProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortKey)}>
      <SelectTrigger
        aria-label="Sortiraj"
        icon={
          <span
            aria-hidden="true"
            className="block h-[7px] w-[7px] border-b-[1.5px] border-r-[1.5px] border-ink-muted [transform:rotate(45deg)_translateY(-2px)]"
          />
        }
        className="h-[42px] w-auto gap-2.5 rounded-[21px] border-line bg-white px-4 text-sm text-ink shadow-none transition-colors duration-150 hover:border-sage focus:ring-0 focus-visible:border-sage [&>span]:line-clamp-none"
      >
        <span className="text-[13px] text-ink-muted">Sortiraj</span>
        <span className="whitespace-nowrap font-medium">
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent
        align="end"
        sideOffset={8}
        className="w-[232px] min-w-[232px] data-[state=open]:animate-[dropIn_150ms_ease_both] rounded-[14px] border-line bg-white p-1.5 shadow-[0_14px_40px_rgba(26,26,26,0.14)]"
      >
        {SORT_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer rounded-[10px] py-2.5 pl-3 pr-8 text-sm text-ink focus:bg-paper focus:text-ink data-[state=checked]:bg-cream data-[state=checked]:font-semibold data-[state=checked]:text-sage-dark [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:text-sage-dark"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
