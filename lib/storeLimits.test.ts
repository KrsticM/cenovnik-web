import { describe, expect, it } from "vitest";
import { STORE_LIMIT_STANDARD, storeLimit } from "./storeLimits";

describe("storeLimit", () => {
  it("caps a user known to be Standard", () => {
    expect(storeLimit(false)).toBe(STORE_LIMIT_STANDARD);
  });

  it("imposes no limit while Premium status is unknown, so a slow check never blocks a Premium user", () => {
    expect(storeLimit(null)).toBe(Infinity);
  });
});
