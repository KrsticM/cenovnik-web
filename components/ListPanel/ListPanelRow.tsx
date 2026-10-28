import type { Ref } from "react";
import type { ShoppingListItem } from "@/types/shoppingList";
import { QuantityStepper } from "@/components/QuantityStepper/QuantityStepper";
import { Button } from "@/components/ui/button";
import { TickBox } from "@/components/ui/check-row";
import { ProductThumb } from "@/components/ui/product-thumb";

interface ListPanelRowProps {
  item: ShoppingListItem;
  tickRef?: Ref<HTMLButtonElement>;
  onCheck: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function ListPanelRow({ item, tickRef, onCheck, onIncrement, onDecrement, onRemove }: ListPanelRowProps) {
  return (
    <div className="grid grid-cols-[26px_56px_minmax(0,1fr)_auto] items-start gap-3.5 border-b border-line-soft py-4">
      <TickBox ref={tickRef} checked={false} onCheckedChange={onCheck} aria-label={`Označi kao kupljeno: ${item.productName}`} className="-ml-[9px] mt-1.5" />
      <ProductThumb barcode={item.primaryBarcode} hasImage={item.hasImage} alt="" className="h-14 rounded-[10px]" />

      <div className="min-w-0">
        <p className="text-sm font-medium leading-[1.3] text-ink">{item.productName}</p>
        {item.price === null && <p className="mt-1 text-xs font-medium text-rust">Nije dostupno u tvojim marketima</p>}
        <div className="mt-2.5">
          <QuantityStepper variant="soft" quantity={item.quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        </div>
      </div>

      <Button
        variant="ghost-muted"
        onClick={onRemove}
        aria-label={`Ukloni ${item.productName}`}
        className="mt-0.5 h-auto rounded-[8px] px-2 py-1.5 text-xs"
      >
        Ukloni
      </Button>
    </div>
  );
}
