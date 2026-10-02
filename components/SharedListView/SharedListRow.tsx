import type { Item } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { CheckRow } from "@/components/ui/check-row";
import { Price } from "@/components/ui/price";
import { ProductThumb } from "@/components/ui/product-thumb";

interface SharedListRowProps {
  item: Item;
  checked: boolean;
  showPrice: boolean;
  onToggle: () => void;
}

// To buy: photo, barcode, quantity pill and line total. Bought: compact, muted name and quantity.
export function SharedListRow({ item, checked, showPrice, onToggle }: SharedListRowProps) {
  if (checked) {
    return (
      <CheckRow checked onCheckedChange={onToggle}>
        <span className="min-w-0 flex-1 text-pretty text-[15px] leading-[1.35] text-ink-muted">
          {item.productName}
        </span>
        <span className="whitespace-nowrap text-[13px] text-ink-muted">× {item.quantity}</span>
      </CheckRow>
    );
  }

  return (
    <CheckRow checked={false} onCheckedChange={onToggle}>
      <ProductThumb
        barcode={item.primaryBarcode}
        hasImage={item.hasImage}
        alt=""
        className="h-12 w-12 shrink-0 rounded-[10px]"
        imgClassName="p-1"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-pretty text-[15px] font-medium leading-[1.35] text-ink">{item.productName}</span>
        {item.primaryBarcode && (
          <span className="mt-[3px] block text-xs text-ink-muted">Barkod {item.primaryBarcode}</span>
        )}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge variant="qty">× {item.quantity}</Badge>
        {showPrice && item.price !== null && (
          <Price value={item.price * item.quantity} className="text-sm" />
        )}
      </span>
    </CheckRow>
  );
}
