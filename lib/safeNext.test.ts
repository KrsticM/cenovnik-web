import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

const FALLBACK = "/proizvodi";

describe("safeNext", () => {
  it("keeps a same-site path with its query and hash", () => {
    expect(safeNext("/proizvodi?proizvod=abc&q=mleko#top")).toBe("/proizvodi?proizvod=abc&q=mleko#top");
  });

  // Each row is a different way a browser ends up on another origin.
  it.each([
    ["absolute url", "https://evil.com"],
    ["scheme-relative", "//evil.com"],
    ["backslash host", "/\\evil.com"],
    ["tab stripped by the URL parser", "/\t/evil.com"],
    ["dot segments collapsing to //", "/a/..//evil.com"],
    ["encoded dot segments collapsing to //", "/a/%2e%2e//evil.com"],
    ["script scheme", "javascript:alert(1)"],
    ["not a path", "proizvodi"],
    ["missing", null],
  ])("falls back for %s", (_label, input) => {
    expect(safeNext(input)).toBe(FALLBACK);
  });

  it("never sends the user back to the sign-in route", () => {
    expect(safeNext("/prijava/email?next=/lista")).toBe(FALLBACK);
  });
});
