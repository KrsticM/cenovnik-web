import { describe, expect, it } from "vitest";
import { storeUrlFor } from "./storeLinks";
import { APP_STORE_URL, PLAY_STORE_URL } from "./support";

describe("storeUrlFor", () => {
  it("sends Android to Google Play and iPhones to the App Store", () => {
    expect(storeUrlFor("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe(PLAY_STORE_URL);
    expect(storeUrlFor("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(APP_STORE_URL);
  });

  it("falls back to the App Store without a user agent", () => {
    expect(storeUrlFor(null)).toBe(APP_STORE_URL);
  });
});
