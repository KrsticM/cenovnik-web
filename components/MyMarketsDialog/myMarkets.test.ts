import { describe, expect, it } from "vitest";
import { myMarketsDialogMode, signedInAs } from "./myMarkets";

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

describe("signedInAs", () => {
  it("never shows Apple's hidden relay address", () => {
    expect(signedInAs({ email: "x7k2@privaterelay.appleid.com", app_metadata: { provider: "apple" } })).toEqual({
      account: "Apple nalog",
      via: "email skriven",
    });
  });

  it("names the provider for Google and Apple, but not for email sign-in", () => {
    expect(signedInAs({ email: "ime@gmail.com", app_metadata: { provider: "google" } }).via).toBe("Google");
    expect(signedInAs({ email: "ime@email.com", app_metadata: { provider: "email" } })).toEqual({ account: "ime@email.com", via: null });
  });
});
