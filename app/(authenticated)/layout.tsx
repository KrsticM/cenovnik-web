import { AppShell } from "@/components/AppShell/AppShell";
import { createClient } from "@/lib/supabase/server";
import { needsStorePicker } from "@/lib/storePickerGate";

// Layouts don't re-render on client navigation, so this runs once per entry into the app.
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requireMyMarkets = user ? await needsStorePicker(supabase, user.id) : false;

  return <AppShell requireMyMarkets={requireMyMarkets}>{children}</AppShell>;
}
