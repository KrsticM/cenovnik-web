import { articleCount } from "@/lib/formatPrice";
import type { ShoppingListItem } from "@/types/shoppingList";

export const ALL_BOUGHT = "Svi artikli sa liste su kupljeni";

// Bought items leave the list and are shown newest first, like the shared list.
export function splitBought(items: ShoppingListItem[]): { active: ShoppingListItem[]; bought: ShoppingListItem[] } {
  const active = items.filter((item) => !item.checkedAt);
  const bought = items
    .filter((item) => item.checkedAt)
    .sort((a, b) => b.checkedAt!.localeCompare(a.checkedAt!));
  return { active, bought };
}

export function progressCaption(count: number, remaining: number): string {
  if (count > 0 && remaining === 0) return ALL_BOUGHT;
  if (remaining < count) return `Preostalo za kupovinu · ${remaining} od ${count}`;
  return articleCount(count);
}

export function itemsTotal(items: ShoppingListItem[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
}
