import type { Metadata } from "next";
import { SharedListView } from "@/components/SharedListView/SharedListView";

export const metadata: Metadata = {
  title: "Lista za kupovinu",
  description: "Podeljena lista za kupovinu iz eCenovnik aplikacije.",
};

export default async function SharedListPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedListView token={token} />;
}
