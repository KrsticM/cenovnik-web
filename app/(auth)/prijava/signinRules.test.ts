import { describe, expect, it } from "vitest";
import { afterFailedVerify, describeNext, isValidEmail } from "./signinRules";

describe("afterFailedVerify", () => {
  it("costs an attempt when the code is wrong", () => {
    expect(afterFailedVerify("invalid", 5, false)).toMatchObject({ attemptsLeft: 4, blocked: false });
  });

  it("blocks the code after the last wrong attempt", () => {
    expect(afterFailedVerify("invalid", 1, false)).toMatchObject({ attemptsLeft: 0, blocked: true });
  });

  it("blocks an expired code without spending an attempt", () => {
    expect(afterFailedVerify("invalid", 5, true)).toMatchObject({ attemptsLeft: 5, blocked: true });
  });

  it.each(["network", "rate-limited"] as const)("never costs an attempt when the failure is %s", (kind) => {
    expect(afterFailedVerify(kind, 3, false)).toMatchObject({ attemptsLeft: 3, blocked: false });
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
