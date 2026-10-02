import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedListView } from "@/components/SharedListView/SharedListView";
import { fetchSharedList } from "@/lib/services/sharedList";

export const metadata: Metadata = {
  title: "Lista za kupovinu",
  description: "Podeljena lista za kupovinu iz eCenovnik aplikacije.",
  // Shared links are private to whoever received them.
  robots: { index: false, follow: false },
};

// Rendered on the server so a dead link answers with a real 404 and the list shows without a loader.
export default async function SharedListPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await fetchSharedList(token);
  if (result.status === "not-found") notFound();

  return <SharedListView token={token} initial={result.status === "ok" ? result.list : null} />;
}
