import { describe, expect, it } from "vitest";
import type { Retailer } from "@/lib/services/retailers";
import { buildChainRows, isDirty, premiumStep, saveLabel, toggleStoreSelection } from "./storePickerModel";

describe("toggleStoreSelection", () => {
  it("adds a store while under the limit", () => {
    expect(toggleStoreSelection(new Set(["a"]), "b", 2)).toEqual(new Set(["a", "b"]));
  });

  it("refuses to add a store at the limit", () => {
    const picked = new Set(["a", "b"]);
    expect(toggleStoreSelection(picked, "c", 2)).toBe(picked);
  });

  it("still removes a store when the user is already over the limit", () => {
    expect(toggleStoreSelection(new Set(["a", "b", "c"]), "a", 2)).toEqual(new Set(["b", "c"]));
  });

  it("never refuses when there is no limit", () => {
    expect(toggleStoreSelection(new Set(["a", "b"]), "c", Infinity)).toEqual(new Set(["a", "b", "c"]));
  });
});

const maxi: Retailer = {
  id: "maxi",
  name: "Maxi",
  stores: [
    { id: "s1", name: "Maxi Šabac", address: "Karađorđeva 1" },
    { id: "s2", name: "Maxi Novi Sad", address: null },
  ],
};
const lidl: Retailer = { id: "lidl", name: "Lidl", stores: [{ id: "s3", name: "Lidl Niš", address: null }] };

const rows = (overrides: Partial<Parameters<typeof buildChainRows>[0]> = {}) =>
  buildChainRows({
    retailers: [maxi, lidl],
    query: "",
    picked: new Set(),
    pinned: new Set(),
    openChains: new Set(),
    limit: Infinity,
    ...overrides,
  });

describe("buildChainRows", () => {
  it("finds stores ignoring accents, with đ typed as dj", () => {
    expect(rows({ query: "sabac" })[0].stores.map((store) => store.id)).toEqual(["s1"]);
    expect(rows({ query: "karadjordjeva" })[0].stores.map((store) => store.id)).toEqual(["s1"]);
  });

  it("hides chains without a match and opens the ones that match", () => {
    const [only, ...rest] = rows({ query: "nis" });
    expect(rest).toEqual([]);
    expect(only).toMatchObject({ id: "lidl", open: true });
  });

  it("lists stores picked before the search first", () => {
    expect(rows({ pinned: new Set(["s2"]) })[0].stores.map((store) => store.id)).toEqual(["s2", "s1"]);
  });

  it("blocks stores that are not picked once the limit is reached, never the picked ones", () => {
    const [chain] = rows({ picked: new Set(["s1"]), limit: 1 });
    expect(chain.stores.map(({ id, blocked }) => [id, blocked])).toEqual([
      ["s1", false],
      ["s2", true],
    ]);
  });

  it("lists chains with picked stores first, keeping the order otherwise", () => {
    expect(rows().map((chain) => chain.id)).toEqual(["maxi", "lidl"]);
    expect(rows({ pinned: new Set(["s3"]) }).map((chain) => chain.id)).toEqual(["lidl", "maxi"]);
  });

  it("starts \"Ostale prodavnice\" at the first store after the picked ones, never while searching", () => {
    const separated = (overrides = {}) => rows(overrides)[0].stores.map((store) => store.separated);
    expect(separated({ pinned: new Set(["s2"]) })).toEqual([false, true]);
    expect(separated()).toEqual([false, false]);
    expect(separated({ pinned: new Set(["s2"]), query: "maxi" })).toEqual([false, false]);
  });

  it("counts picked stores in the subtitle, and results while searching", () => {
    expect(rows({ picked: new Set(["s1"]) })[0].subtitle).toBe("1 od 2 izabrano");
    expect(rows()[0].subtitle).toBe("2 marketa");
    expect(rows({ query: "maxi" })[0].subtitle).toBe("2 rezultata");
  });
});

describe("saveLabel", () => {
  it("asks for the missing stores, then shows the count", () => {
    expect(saveLabel(0, false)).toBe("Izaberi još 2 marketa");
    expect(saveLabel(1, false)).toBe("Izaberi još 1 market");
    expect(saveLabel(3, false)).toBe("Sačuvaj · 3 marketa");
    expect(saveLabel(3, true)).toBe("Čuvamo…");
  });
});

describe("isDirty", () => {
  it("is false for the saved set in any order, true when a store was added or removed", () => {
    expect(isDirty(new Set(["a", "b"]), new Set(["b", "a"]))).toBe(false);
    expect(isDirty(new Set(["a", "b", "c"]), new Set(["a", "b"]))).toBe(true);
    expect(isDirty(new Set(["a"]), new Set(["a", "b"]))).toBe(true);
    expect(isDirty(new Set(["a", "c"]), new Set(["a", "b"]))).toBe(true);
  });
});

describe("premiumStep", () => {
  it("asks only when there is something unsaved", () => {
    expect(premiumStep(true)).toBe("ask");
    expect(premiumStep(false)).toBe("settings");
  });
});
