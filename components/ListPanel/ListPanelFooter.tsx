import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";

interface ListPanelFooterProps {
  caption: string;
  // Only Uporedi markete shows a sum; the item tab has no prices.
  total: number | null;
  onContinue: () => void;
  onClear: () => void;
}

export function ListPanelFooter({ caption, total, onContinue, onClear }: ListPanelFooterProps) {
  return (
    <div className="border-t border-line bg-white px-5 pb-[22px] pt-[18px]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink-muted">{caption}</span>
        {total !== null && <Price value={total} size="total" tone="ink" />}
      </div>
      <div className="mt-4 flex gap-2.5">
        <Button variant="sage" size="pill-lg" onClick={onContinue} className="flex-1">
          Nazad na pretragu
        </Button>
        <Button variant="pill-muted" size="pill-lg" onClick={onClear}>
          Isprazni
        </Button>
      </div>
    </div>
  );
}
