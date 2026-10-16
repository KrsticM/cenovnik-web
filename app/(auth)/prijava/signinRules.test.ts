import { describe, expect, it } from "vitest";
import { afterFailedVerify, describeNext, isValidEmail } from "./signinRules";

describe("afterFailedVerify", () => {
  it("lets the user try again when the code is wrong", () => {
    expect(afterFailedVerify("invalid", false)).toMatchObject({ blocked: false, error: "Kod nije tačan. Pokušaj ponovo." });
  });

  it("blocks an expired code so a new one is requested", () => {
    expect(afterFailedVerify("invalid", true)).toMatchObject({ blocked: true });
  });

  it.each(["network", "rate-limited"] as const)("does not block on %s", (kind) => {
    expect(afterFailedVerify(kind, false)).toMatchObject({ blocked: false });
  });
});

describe("describeNext", () => {
  it.each([
    ["the default page, which needs no mention", "/proizvodi", null],
    ["a product link", "/proizvodi?proizvod=abc", "proizvod koji si otvorio"],
    ["a search", "/proizvodi?q=mleko", "proizvode"],
    ["a known page", "/lista", "tvoju listu"],
    ["an unknown page", "/nesto", "stranicu koju si otvorio"],
  ])("names %s", (_label, next, expected) => {
    expect(describeNext(next)).toBe(expected);
  });
});

describe("isValidEmail", () => {
  it("accepts an ordinary address", () => {
    expect(isValidEmail("ime@email.com")).toBe(true);
  });

  it.each(["ime@", "ime@email", "ime email@x.com", "@email.com"])("rejects %s", (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});
