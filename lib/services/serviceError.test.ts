import { describe, expect, it } from "vitest";
import { isAborted, isTransient, ServiceError } from "./serviceError";

describe("retry decisions", () => {
  it.each([
    ["a statement timeout", { code: "57014", message: "canceling statement" }],
    ["an expired session", { code: "PGRST301", message: "JWT expired" }],
    ["a network failure", { code: "", message: "TypeError: Failed to fetch" }],
  ])("retries %s", (_label, error) => {
    expect(isTransient(new ServiceError(error))).toBe(true);
  });

  it("never retries a request we cancelled ourselves, and reports it as aborted", () => {
    const cancelled = new ServiceError({ code: "", message: "AbortError: signal is aborted" });
    expect(isAborted(cancelled)).toBe(true);
    expect(isTransient(cancelled)).toBe(false);
  });

  it("does not retry a real database error", () => {
    expect(isTransient(new ServiceError({ code: "42501", message: "permission denied for table" }))).toBe(false);
  });
});
