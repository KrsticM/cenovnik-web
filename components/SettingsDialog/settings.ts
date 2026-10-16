import { signedInAs, type SignInKind } from "@/components/MyMarketsDialog/myMarkets";

export const SETTINGS_PARAM = "podesavanja";

export type AccountKind = SignInKind;

const PROVIDER_LINES = { google: "Prijava preko Google-a", apple: "Prijava preko Apple-a", email: "Prijava emailom i kodom" };

export function accountSummary(user: { email?: string; app_metadata: { provider?: string } }) {
  const { account, via, kind } = signedInAs(user);
  const line = via === "email skriven" ? `${PROVIDER_LINES.apple} · email je skriven` : PROVIDER_LINES[kind];
  return { account, kind, line };
}
