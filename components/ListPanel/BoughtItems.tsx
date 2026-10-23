import type { ShoppingListItem } from "@/types/shoppingList";
import { CheckRow } from "@/components/ui/check-row";
import { DoneSection } from "@/components/SharedListView/DoneSection";

interface BoughtItemsProps {
  items: ShoppingListItem[];
  onUncheck: (productId: string) => void;
}

export function BoughtItems({ items, onUncheck }: BoughtItemsProps) {
  return (
    <DoneSection count={items.length} className="-mx-5 mt-2" triggerClassName="px-5">
      {items.map((item) => (
        <CheckRow
          key={item.id}
          checked
          onCheckedChange={() => onUncheck(item.productId)}
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
