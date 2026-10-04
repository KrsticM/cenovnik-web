import { formatPrice } from "@/lib/formatPrice";
import type { ShoppingListItem } from "@/types/shoppingList";
import { QuantityStepper } from "@/components/QuantityStepper/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { ProductThumb } from "@/components/ui/product-thumb";

interface ListPanelRowProps {
  item: ShoppingListItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function ListPanelRow({ item, onIncrement, onDecrement, onRemove }: ListPanelRowProps) {
  const available = item.price !== null;

  return (
    <div className="grid grid-cols-[56px_1fr_auto] items-start gap-3.5 border-b border-line-soft py-4">
      <ProductThumb barcode={item.primaryBarcode} hasImage={item.hasImage} alt="" className="h-14 rounded-[10px]" />

      <div className="min-w-0">
        <p className="text-sm font-medium leading-[1.3] text-ink">{item.productName}</p>
        {available && item.quantity > 1 && (
          <p className="mt-1 text-xs text-ink-muted">
            {item.quantity} × {formatPrice(item.price)}
          </p>
        )}
        {!available && <p className="mt-1 text-xs font-medium text-rust">Nije dostupno u tvojim marketima</p>}
        <div className="mt-2.5">
          <QuantityStepper variant="soft" quantity={item.quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        </div>
      </div>

      <div className="text-right">
        <Price value={available ? item.price! * item.quantity : null} size="row" className="block" />
        <Button
          variant="ghost-muted"
          onClick={onRemove}
          aria-label={`Ukloni ${item.productName}`}
          className="mt-2.5 h-auto rounded-[8px] px-2 py-1.5 text-xs"
        >
          Ukloni
        </Button>
      </div>
    </div>
  );
}
