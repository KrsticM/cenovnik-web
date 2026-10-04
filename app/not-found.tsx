import type { Metadata } from "next";
import { NotFoundScreen } from "@/components/StatePage/NotFoundScreen";
import AuthenticatedLayout from "./(authenticated)/layout";

export const metadata: Metadata = { title: "Stranica ne postoji" };

// Unknown URLs keep the app header (logo, list, account) so nobody lands on a dead end.
export default function NotFound() {
  return (
    <AuthenticatedLayout>
      <main className="bg-paper">
        <NotFoundScreen />
      </main>
    </AuthenticatedLayout>
  );
}
