import { describe, expect, it } from "vitest";
import { myMarketsDialogMode } from "./myMarkets";

describe("myMarketsDialogMode", () => {
  it("opens, and cannot be dismissed, for an account that still has to choose its stores", () => {
    expect(myMarketsDialogMode({ required: true, requested: false })).toEqual({ open: true, dismissable: false });
  });

  it("opens and can be closed when the user asked for it", () => {
    expect(myMarketsDialogMode({ required: false, requested: true })).toEqual({ open: true, dismissable: true });
  });

  it("stays closed otherwise", () => {
    expect(myMarketsDialogMode({ required: false, requested: false }).open).toBe(false);
  });
});
