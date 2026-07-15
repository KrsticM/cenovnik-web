import type { Metadata } from "next";
import ShoppingListView from "./ShoppingListView";

export const metadata: Metadata = {
  title: "Lista za kupovinu",
  description: "Podeljena lista za kupovinu iz eCenovnik aplikacije.",
};

export default async function SharedListPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ShoppingListView token={token} />;
}
