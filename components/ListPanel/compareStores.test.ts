import { describe, expect, it } from "vitest";
import type { ProductOffer } from "@/lib/services/products";
import type { Store } from "@/lib/services/stores";
import type { ShoppingListItem } from "@/types/shoppingList";
import { compareStores } from "./compareStores";

const item = (productId: string, quantity: number, checkedAt: string | null = null): ShoppingListItem => ({
  id: productId,
  shoppingListId: "list",
  productId,
  productName: productId,
  primaryBarcode: null,
  hasImage: false,
  quantity,
  price: null,
  checkedAt,
  createdAt: "2026-10-01T10:00:00.000Z",
});

const store = (id: string): Store => ({ id, retailerId: id, retailerName: id, address: null });
const offer = (storeId: string, price: number): ProductOffer => ({
  retailerId: storeId,
  retailerName: storeId,
  price,
  regularPrice: price,
  storeId,
  address: null,
  isDeal: false,
});

const stores = new Map([
  ["maxi", store("maxi")],
  ["lidl", store("lidl")],
]);
// Cheapest offer first, as fetchProductOffers returns them.
const offers = {
  milk: [offer("lidl", 100), offer("maxi", 120)],
  bread: [offer("maxi", 50)],
  salt: [],
};

describe("compareStores", () => {
  it("leaves bought items out of every total and missing list", () => {
    const items = [item("milk", 2), item("bread", 1, "2026-10-23T10:00:00.000Z"), item("salt", 1, "2026-10-23T10:00:00.000Z")];

    const { rows, cheapestComplete, usedStoreCount, unavailableCount } = compareStores(items, offers, stores);

    expect(rows.map((r) => [r.store.id, r.total, r.missing.length])).toEqual([
      ["lidl", 200, 0],
      ["maxi", 240, 0],
    ]);
    expect(cheapestComplete?.store.id).toBe("lidl");
    expect(usedStoreCount).toBe(1);
    expect(unavailableCount).toBe(0);
  });

  it("ranks stores by fewest missing items before price", () => {
    const { rows, cheapestComplete } = compareStores([item("milk", 1), item("bread", 1)], offers, stores);

    expect(rows.map((r) => r.store.id)).toEqual(["maxi", "lidl"]);
    expect(cheapestComplete?.store.id).toBe("maxi");
  });

  it("has nothing to compare when everything is bought", () => {
    const { rows, cheapestComplete } = compareStores([item("milk", 1, "2026-10-23T10:00:00.000Z")], offers, stores);

    expect(rows).toEqual([]);
    expect(cheapestComplete).toBeNull();
  });
});
