import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell/AppShell";
import { createClient } from "@/lib/supabase/server";
import { needsStorePicker, storePickerPath } from "@/lib/storePickerGate";

// Layouts don't re-render on client navigation, so this runs once per entry into the app.
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await needsStorePicker(supabase, user.id))) redirect(storePickerPath());

  return <AppShell>{children}</AppShell>;
}
