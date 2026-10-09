import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSigninShowcase } from "@/lib/services/signinShowcase";
import { safeNext } from "@/lib/safeNext";
import { STORE_PICKER_STEP } from "@/lib/storePickerGate";
import { SigninBackdrop } from "./components/SigninBackdrop";
import { SigninFlow } from "./components/SigninFlow";
import type { OAuthError } from "./hooks/useSigninFlow";

export const metadata: Metadata = { title: "Prijava" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? null;

export default async function PrijavaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNext(param(params.next));
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    showcase,
  ] = await Promise.all([supabase.auth.getUser(), fetchSigninShowcase()]);

  // Signed-in users only come here to pick their stores; everyone else goes on.
  const picking = param(params.korak) === STORE_PICKER_STEP;
  if (user && !picking) redirect(next);

  const provider = param(params.provider);
  const oauthError: OAuthError | null =
    param(params.error) === "auth_failed" ? (provider === "apple" || provider === "google" ? provider : "unknown") : null;

  return (
    <>
      <SigninBackdrop items={showcase} />
      <SigninFlow
        next={next}
        initialStep={user && picking ? "markets" : "start"}
        initialUserId={user?.id ?? null}
        initialOAuthError={oauthError}
      />
    </>
  );
}
