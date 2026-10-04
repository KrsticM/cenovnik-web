import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedListView } from "@/components/SharedListView/SharedListView";
import { fetchSharedList, normalizeShareToken } from "@/lib/services/sharedList";

export const metadata: Metadata = {
  title: "Lista za kupovinu",
  description: "Podeljena lista za kupovinu iz eCenovnik aplikacije.",
  robots: { index: false, follow: false },
};

// Server-rendered so a dead link returns a real 404.
export default async function SharedListPage({ params }: { params: Promise<{ token: string }> }) {
  const token = normalizeShareToken((await params).token);
  const result = await fetchSharedList(token);
  if (result.status === "not-found") notFound();

  return <SharedListView token={token} initial={result.status === "ok" ? result.list : null} />;
}
