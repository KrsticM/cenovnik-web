export const MY_MARKETS_PARAM = "moji-marketi";

// An account with fewer than two stores cannot leave the dialog until it has saved them.
export function myMarketsDialogMode({ required, requested }: { required: boolean; requested: boolean }) {
  return { open: required || requested, dismissable: !required };
}

const PROVIDER_LABELS: Record<string, string> = { google: "Google", apple: "Apple" };

export type SignInKind = "google" | "apple" | "email";

// Apple's "Hide My Email" relay address means nothing to the user, so it is never shown.
export function signedInAs(user: { email?: string; app_metadata: { provider?: string } }) {
  const email = user.email ?? "";
  const provider = user.app_metadata.provider;
  const kind: SignInKind = provider === "google" ? "google" : provider === "apple" || email.endsWith("@privaterelay.appleid.com") ? "apple" : "email";
  if (email.endsWith("@privaterelay.appleid.com")) return { account: "Apple nalog", via: "email skriven", kind };
  return { account: email, via: PROVIDER_LABELS[provider ?? ""] ?? null, kind };
}
