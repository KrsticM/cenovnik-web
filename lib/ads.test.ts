import { describe, expect, it } from "vitest";
import { shouldShowAds, withAdRows } from "@/lib/ads";

const cards = (count: number) => Array.from({ length: count }, (_, i) => `p${i + 1}`);
const adPositions = (entries: ReturnType<typeof withAdRows<string>>) =>
  entries.flatMap((entry, position) => (entry.kind === "ad" ? [position] : []));

describe("withAdRows", () => {
  it.each([
    [2, [6, 13]],
    [3, [9, 19]],
    [4, [12, 25]],
  ])("with %i columns puts an ad row after every 3 full rows", (columns, positions) => {
    const entries = withAdRows(cards(columns * 6), columns, true);

    expect(adPositions(entries)).toEqual(positions);
  });

  it("adds no ad before 3 rows are full", () => {
    const entries = withAdRows(cards(11), 4, true);

    expect(adPositions(entries)).toEqual([]);
  });

  it("numbers ad rows in order so each keeps its identity as more products load", () => {
    const entries = withAdRows(cards(24), 4, true);

    expect(entries.filter((entry) => entry.kind === "ad")).toEqual([
      { kind: "ad", index: 0 },
      { kind: "ad", index: 1 },
    ]);
  });

  it("keeps every product in order and adds nothing when ads are off", () => {
    const entries = withAdRows(cards(24), 4, false);

    expect(entries).toEqual(cards(24).map((item) => ({ kind: "item", item })));
  });
});

describe("shouldShowAds", () => {
  it.each([
    ["hides ads from Premium users", true, "ca-pub-1", false],
    ["hides ads while the Premium status is unknown", null, "ca-pub-1", false],
    ["hides ads when no AdSense client is configured", false, "", false],
    ["shows ads to Standard users", false, "ca-pub-1", true],
  ])("%s", (_case, isPremium, client, expected) => {
    expect(shouldShowAds(isPremium, client)).toBe(expected);
  });
});
