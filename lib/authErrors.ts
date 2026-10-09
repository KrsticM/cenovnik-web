export type VerifyFailureKind = "invalid" | "rate-limited" | "network";

// Supabase answers wrong and expired codes alike, so anything but a rate limit or transport failure is "invalid".
export function classifyVerifyError(error: unknown): VerifyFailureKind {
  const { name, status, code } = (error ?? {}) as { name?: string; status?: number; code?: string };

  if (status === 429 || code === "over_request_rate_limit" || code === "over_email_send_rate_limit") {
    return "rate-limited";
  }
  const reachedServer = typeof status === "number" && status > 0 && status < 500;
  if (name === "AuthRetryableFetchError" || !reachedServer) return "network";
  return "invalid";
}
