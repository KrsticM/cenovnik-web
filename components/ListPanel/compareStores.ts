import type { ProductOffer } from "@/lib/services/products";
import type { Store } from "@/lib/services/stores";
import type { ShoppingListItem } from "@/types/shoppingList";

export type StoreComparisonRow = {
  store: Store;
  total: number;
  available: ShoppingListItem[];
  missing: ShoppingListItem[];
};

export type ListComparison = {
  rows: StoreComparisonRow[];
  cheapestComplete: StoreComparisonRow | null;
  usedStoreCount: number;
  unavailableCount: number;
};

// Only what is left to buy is compared; bought items count nowhere.
export function compareStores(
  items: ShoppingListItem[],
  offers: Record<string, ProductOffer[]>,
  stores: Map<string, Store>
): ListComparison {
  const active = items.filter((i) => !i.checkedAt);
  const priceAt = (item: ShoppingListItem, storeId: string) =>
    offers[item.productId]?.find((o) => o.storeId === storeId)?.price ?? null;

  const rows = (active.length > 0 ? [...stores.values()] : [])
    .map((store) => {
      const available = active.filter((i) => priceAt(i, store.id) !== null);
      const missing = active.filter((i) => priceAt(i, store.id) === null);
      const total = available.reduce((sum, i) => sum + priceAt(i, store.id)! * i.quantity, 0);
      return { store, total, available, missing };
    })
    .sort((a, b) => a.missing.length - b.missing.length || a.total - b.total);

  const usedStores = new Set(active.map((i) => offers[i.productId]?.[0]?.storeId).filter(Boolean));

  return {
    rows,
    cheapestComplete: rows.find((r) => r.missing.length === 0) ?? null,
    usedStoreCount: usedStores.size,
    unavailableCount: active.filter((i) => !offers[i.productId]?.length).length,
  };
}
