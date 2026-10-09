import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { safeNext } from "@/lib/safeNext";
import { needsStorePicker, storePickerPath } from "@/lib/storePickerGate";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (await needsStorePicker(supabase, data.user.id)) {
        return NextResponse.redirect(new URL(storePickerPath(next), request.url));
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("[auth/callback] Code exchange failed:", error.message);
  }

  // Cancelling at the provider is not an error, so the user just lands back on the start screen.
  const failed = new URL("/prijava", request.url);
  if (next !== "/proizvodi") failed.searchParams.set("next", next);
  if (searchParams.get("error") !== "access_denied") {
    failed.searchParams.set("error", "auth_failed");
    const provider = searchParams.get("provider");
    if (provider === "apple" || provider === "google") failed.searchParams.set("provider", provider);
  }
  return NextResponse.redirect(failed);
}
