import { describe, expect, it } from "vitest";
import type { ShoppingListItem } from "@/types/shoppingList";
import { isOwnEcho, tickAfterQuantity } from "./listTicks";

const shown = (quantity: number, checkedAt: string | null): ShoppingListItem => ({
  id: "row",
  shoppingListId: "list",
  productId: "milk",
  productName: "milk",
  primaryBarcode: null,
  hasImage: false,
  quantity,
  price: null,
  checkedAt,
  createdAt: "2026-10-01T10:00:00.000Z",
});

describe("isOwnEcho", () => {
  it("skips our own tick even though the server stamped a different time", () => {
    expect(isOwnEcho(shown(2, "2026-10-23T10:00:00.000Z"), { id: "row", quantity: 2, checked_at: "2026-10-23T10:00:01.000Z" })).toBe(true);
  });

  it("reloads for a tick made through the shared link", () => {
    expect(isOwnEcho(shown(2, null), { id: "row", quantity: 2, checked_at: "2026-10-23T10:00:00.000Z" })).toBe(false);
  });

  it("reloads for a quantity change made elsewhere", () => {
    expect(isOwnEcho(shown(2, null), { id: "row", quantity: 3, checked_at: null })).toBe(false);
  });

  it("reloads for a row the list does not show yet", () => {
    expect(isOwnEcho(undefined, { id: "row", quantity: 1, checked_at: null })).toBe(false);
  });
});

describe("tickAfterQuantity", () => {
  const bought = { quantity: 1, checkedAt: "2026-10-23T10:00:00.000Z" };

  it("puts a bought product back on the list when more is added", () => {
    expect(tickAfterQuantity(bought, 2)).toBeNull();
  });

  it("keeps the tick when a bought product's quantity goes down", () => {
    expect(tickAfterQuantity({ ...bought, quantity: 3 }, 2)).toBeUndefined();
  });

  it("leaves items that are still to buy alone", () => {
    expect(tickAfterQuantity({ quantity: 1, checkedAt: null }, 2)).toBeUndefined();
  });

  it("restores the tick of an item brought back by undo", () => {
    expect(tickAfterQuantity(undefined, 1, bought.checkedAt)).toBe(bought.checkedAt);
  });
});
