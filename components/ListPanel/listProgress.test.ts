import { describe, expect, it } from "vitest";
import type { ShoppingListItem } from "@/types/shoppingList";
import { progressCaption, splitBought } from "./listProgress";

const item = (productId: string, checkedAt: string | null = null): ShoppingListItem => ({
  id: productId,
  shoppingListId: "list",
  productId,
  productName: productId,
  primaryBarcode: null,
  hasImage: false,
  quantity: 1,
  price: null,
  checkedAt,
  createdAt: "2026-10-01T10:00:00.000Z",
});

describe("splitBought", () => {
  it("keeps unticked items in list order and puts the latest tick first", () => {
    const items = [
      item("milk", "2026-10-23T10:00:00.000Z"),
      item("bread"),
      item("eggs", "2026-10-23T11:00:00.000Z"),
      item("salt"),
    ];

    const { active, bought } = splitBought(items);

    expect(active.map((i) => i.productId)).toEqual(["bread", "salt"]);
    expect(bought.map((i) => i.productId)).toEqual(["eggs", "milk"]);
  });
});

describe("progressCaption", () => {
  it.each([
    [8, 8, "8 artikala"],
    [8, 3, "Preostalo za kupovinu · 3 od 8"],
    [8, 0, "Svi artikli sa liste su kupljeni"],
  ])("with %i items and %i left says %s", (count, remaining, caption) => {
    expect(progressCaption(count, remaining)).toBe(caption);
  });

  it("counts an empty list instead of calling it bought", () => {
    expect(progressCaption(0, 0)).toBe("0 artikala");
  });
});
