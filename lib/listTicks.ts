import type { ShoppingListItem } from "@/types/shoppingList";

export type ListItemChange = { id?: string; quantity?: number; checked_at?: string | null };

// An update matching what is shown is our own write echoing back; anything else (a tick from the shared link) needs a reload.
export function isOwnEcho(shown: ShoppingListItem | undefined, row: ListItemChange): boolean {
  return !!shown && shown.quantity === row.quantity && !shown.checkedAt === !row.checked_at;
}

// What a quantity change does to the tick: undefined keeps it, null puts the item back on the list.
export function tickAfterQuantity(
  existing: Pick<ShoppingListItem, "quantity" | "checkedAt"> | undefined,
  quantity: number,
  restoredCheckedAt?: string | null
): string | null | undefined {
  // A removed item comes back as it was; adding more of a bought product means it is needed again.
  if (!existing) return restoredCheckedAt;
  return existing.checkedAt && quantity > existing.quantity ? null : undefined;
}
