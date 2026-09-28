"use client";

import { PillSwitch } from "@/components/PillSwitch/PillSwitch";
import { PricePresets } from "./PricePresets";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export interface FilterControlsProps {
  myMarkets: boolean;
  onMyMarketsChange: (value: boolean) => void;
  priceRange: number | null;
  onPriceToggle: (index: number) => void;
  dealsOnly: boolean;
  onDealsOnlyChange: (value: boolean) => void;
  hasFilters: boolean;
  onClear: () => void;
}

const Divider = () => <Separator orientation="vertical" className="h-6 bg-line" />;

export function FilterBar(props: FilterControlsProps) {
  return (
    <Card
      aria-label="Filteri"
      className="-mt-2 mb-6 hidden flex-wrap items-center gap-3 rounded-2xl border-line bg-white p-2.5 shadow-none lg:flex"
    >
      <PillSwitch label="Samo moji marketi" checked={props.myMarkets} onCheckedChange={props.onMyMarketsChange} />
      <Divider />
      <span className="text-[13px] text-ink-muted">Cena</span>
      <PricePresets value={props.priceRange} onToggle={props.onPriceToggle} />
      <Divider />
      <PillSwitch label="Samo akcije" checked={props.dealsOnly} onCheckedChange={props.onDealsOnlyChange} />
      {props.hasFilters && (
        <Button variant="underline" onClick={props.onClear} className="ml-auto h-9 rounded-[18px] px-3 text-[13px]">
          Očisti filtere
        </Button>
      )}
    </Card>
  );
}
