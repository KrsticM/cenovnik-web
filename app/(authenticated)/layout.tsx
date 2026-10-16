import { AppShell } from "@/components/AppShell/AppShell";
import { createClient } from "@/lib/supabase/server";
import { needsStorePicker } from "@/lib/storePickerGate";

// Layouts don't re-render on client navigation, so this runs once per entry into the app.
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // The proxy has already authenticated the request; the claims only name the user, so no second round trip to Auth.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  const requireMyMarkets = userId ? await needsStorePicker(supabase, userId) : false;

  return <AppShell requireMyMarkets={requireMyMarkets}>{children}</AppShell>;
}
