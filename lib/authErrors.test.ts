import { describe, expect, it } from "vitest";
import { classifyVerifyError } from "./authErrors";

describe("classifyVerifyError", () => {
  it.each([
    ["Supabase rejects the code", { name: "AuthApiError", status: 403, code: "otp_expired" }, "invalid"],
    ["too many requests", { name: "AuthApiError", status: 429, code: "over_request_rate_limit" }, "rate-limited"],
    ["offline", { name: "AuthRetryableFetchError", status: 0 }, "network"],
    ["server error", { name: "AuthApiError", status: 502 }, "network"],
    ["fetch itself throws", new TypeError("Failed to fetch"), "network"],
  ])("treats %s as %s", (_label, error, expected) => {
    expect(classifyVerifyError(error)).toBe(expected);
  });
});
