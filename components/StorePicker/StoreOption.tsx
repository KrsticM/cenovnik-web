import { OptionRow } from "@/components/ui/option-row";
import type { StoreOptionRow } from "./storePickerModel";

interface StoreOptionProps {
  store: StoreOptionRow;
  onToggle: (storeId: string) => void;
}

export function StoreOption({ store, onToggle }: StoreOptionProps) {
  return (
    <OptionRow checked={store.picked} disabled={store.blocked} onCheckedChange={() => onToggle(store.id)}>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-medium text-ink">{store.name}</span>
        {store.address && <span className="text-[13px] text-ink-muted">{store.address}</span>}
      </span>
    </OptionRow>
  );
}
