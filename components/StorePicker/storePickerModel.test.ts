import { describe, expect, it } from "vitest";
import type { Retailer } from "@/lib/services/retailers";
import { buildChainRows, toggleStoreSelection } from "./storePickerModel";

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
});
