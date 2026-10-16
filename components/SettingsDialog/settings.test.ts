import { describe, expect, it } from "vitest";
import { accountSummary } from "./settings";

describe("accountSummary", () => {
  it("names the sign-in provider", () => {
    expect(accountSummary({ email: "a@gmail.com", app_metadata: { provider: "google" } })).toEqual({
      account: "a@gmail.com",
      kind: "google",
      line: "Prijava preko Google-a",
    });
    expect(accountSummary({ email: "a@b.rs", app_metadata: { provider: "email" } })).toMatchObject({
      kind: "email",
      line: "Prijava emailom i kodom",
    });
  });

  it("never shows Apple's relay address", () => {
    expect(accountSummary({ email: "x@privaterelay.appleid.com", app_metadata: { provider: "apple" } })).toEqual({
      account: "Apple nalog",
      kind: "apple",
      line: "Prijava preko Apple-a · email je skriven",
    });
  });
});
