import { NextResponse } from "next/server";
import { fetchIsPremium, fetchSubscriptionDetails } from "@/lib/revenuecat";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nisi prijavljen." }, { status: 401 });

  const secret = process.env.REVENUECAT_SECRET_KEY;
  const projectId = process.env.REVENUECAT_PROJECT_ID;
  if (!secret || !projectId) {
    console.error("[pretplata] REVENUECAT_SECRET_KEY or REVENUECAT_PROJECT_ID is not set");
    return unknown(500);
  }

  try {
    const config = { secret, projectId };
    const isPremium = await fetchIsPremium(user.id, config);
    // Details only decorate the answer, so a failure here must not turn a known status into "unknown".
    const subscription = isPremium
      ? await fetchSubscriptionDetails(user.id, config).catch((err) => {
          console.error("[pretplata] RevenueCat subscription details failed:", err);
          return null;
        })
      : null;
    // Not cached either: the browser keys its cache by URL, so another account or a fresh purchase would see a stale answer.
    return NextResponse.json({ isPremium, subscription }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    console.error("[pretplata] RevenueCat request failed:", err);
    return unknown(502);
  }
}

// Failures are never cached, or one RevenueCat blip would downgrade a paying user.
function unknown(status: number) {
  return NextResponse.json({ isPremium: null }, { status, headers: { "Cache-Control": "no-store" } });
}
