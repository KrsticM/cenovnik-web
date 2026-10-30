import type { Ref } from "react";
import type { ShoppingListItem } from "@/types/shoppingList";
import { CheckRow } from "@/components/ui/check-row";
import { DoneSection } from "@/components/SharedListView/DoneSection";

interface BoughtItemsProps {
  items: ShoppingListItem[];
  rowRef: (productId: string) => Ref<HTMLButtonElement>;
  triggerRef: Ref<HTMLButtonElement>;
  onUncheck: (item: ShoppingListItem) => void;
}

export function BoughtItems({ items, rowRef, triggerRef, onUncheck }: BoughtItemsProps) {
  return (
    <DoneSection count={items.length} triggerRef={triggerRef} className="-mx-5 mt-2" triggerClassName="px-5">
      {items.map((item) => (
        <CheckRow
          key={item.id}
          ref={rowRef(item.productId)}
          checked
          onCheckedChange={() => onUncheck(item)}
          aria-label={`Vrati na listu: ${item.productName}`}
          className="px-5"
        >
          <span className="min-w-0 flex-1 text-pretty text-[15px] leading-[1.35] text-ink-muted">{item.productName}</span>
          <span className="whitespace-nowrap text-[13px] text-ink-muted">× {item.quantity}</span>
        </CheckRow>
      ))}
    </DoneSection>
  );
}
