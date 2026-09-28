"use client";

import { PillSwitch } from "@/components/PillSwitch/PillSwitch";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { FilterControlsProps } from "./FilterBar";
import { PricePresets } from "./PricePresets";

interface FilterDrawerProps extends FilterControlsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultLabel: string;
}

export function FilterDrawer({ open, onOpenChange, resultLabel, ...props }: FilterDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        hideClose
        overlayClassName="bg-[rgba(26,26,26,0.2)] data-[state=open]:animate-[fadeIn_180ms_ease_both]"
        className="w-[86%] max-w-none data-[state=open]:animate-[fadeIn_160ms_ease_both] gap-6 overflow-y-auto rounded-r-[18px] border-0 bg-white p-5 shadow-[24px_0_60px_rgba(26,26,26,0.18)] sm:w-[360px] sm:max-w-none"
      >
        <div className="flex items-baseline justify-between gap-3">
          <SheetTitle className="text-[17px] font-semibold text-ink">Filteri</SheetTitle>
          <SheetDescription className="sr-only">Suzite prikaz proizvoda</SheetDescription>
          {props.hasFilters && (
            <Button variant="underline" size="text" onClick={props.onClear} className="text-[13px] no-underline hover:text-sage-dark">
              Očisti sve
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <SectionLabel>Prodavnice</SectionLabel>
          <PillSwitch className="self-start" label="Samo moji marketi" checked={props.myMarkets} onCheckedChange={props.onMyMarketsChange} />
        </div>

        <div className="flex flex-col gap-2.5">
          <SectionLabel>Cena</SectionLabel>
          <PricePresets value={props.priceRange} onToggle={props.onPriceToggle} />
        </div>

        <div className="flex flex-col gap-2.5">
          <SectionLabel>Ponuda</SectionLabel>
          <PillSwitch className="self-start" label="Samo akcije" checked={props.dealsOnly} onCheckedChange={props.onDealsOnlyChange} />
        </div>

        <Button variant="sage" size="pill-lg" onClick={() => onOpenChange(false)} className="mt-auto w-full shrink-0 hover:bg-sage-dark">
          Prikaži {resultLabel}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
