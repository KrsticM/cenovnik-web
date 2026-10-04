import type { Ref } from "react";
import type { SharedListItem } from "@/lib/services/sharedList";
import { Badge } from "@/components/ui/badge";
import { CheckRow } from "@/components/ui/check-row";
import { Price } from "@/components/ui/price";
import { ProductThumb } from "@/components/ui/product-thumb";

interface SharedListRowProps {
  item: SharedListItem;
  checked: boolean;
  showPrice: boolean;
  onToggle: () => void;
  ref?: Ref<HTMLButtonElement>;
}

export function SharedListRow({ item, checked, showPrice, onToggle, ref }: SharedListRowProps) {
  if (checked) {
    return (
      <CheckRow ref={ref} checked onCheckedChange={onToggle}>
        <span className="min-w-0 flex-1 text-pretty text-[15px] leading-[1.35] text-ink-muted">
          {item.productName}
        </span>
        <span className="whitespace-nowrap text-[13px] text-ink-muted">× {item.quantity}</span>
      </CheckRow>
    );
  }

  return (
    <CheckRow ref={ref} checked={false} onCheckedChange={onToggle}>
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
