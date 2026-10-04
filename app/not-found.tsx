import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell/AppShell";
import { NotFoundScreen } from "@/components/StatePage/NotFoundScreen";
import { SimpleHeader } from "@/components/StatePage/SimpleHeader";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Stranica ne postoji" };

export default async function NotFound() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = (
    <main className="bg-paper">
      <NotFoundScreen />
    </main>
  );

  if (user) return <AppShell>{page}</AppShell>;
  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <SimpleHeader />
      {page}
    </div>
  );
}
