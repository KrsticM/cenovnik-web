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
    return NextResponse.json({ isPremium, subscription }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (err) {
    console.error("[pretplata] RevenueCat request failed:", err);
    return unknown(502);
  }
}

// Failures are never cached, or one RevenueCat blip would downgrade a paying user for minutes.
function unknown(status: number) {
  return NextResponse.json({ isPremium: null }, { status, headers: { "Cache-Control": "no-store" } });
}
