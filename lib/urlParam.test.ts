import { describe, expect, it } from "vitest";
import { withParam } from "./urlParam";

describe("withParam", () => {
  it("adds a parameter and keeps the path, the other parameters and the hash", () => {
    expect(withParam("https://app.test/proizvodi?q=mleko#top", "moji-marketi", "1")).toBe(
      "https://app.test/proizvodi?q=mleko&moji-marketi=1#top"
    );
  });

  it("removes only that parameter", () => {
    expect(withParam("https://app.test/proizvodi?q=mleko&moji-marketi=1", "moji-marketi", null)).toBe(
      "https://app.test/proizvodi?q=mleko"
    );
  });
});
