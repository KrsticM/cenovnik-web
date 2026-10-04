import type { Metadata } from "next";
import { SimpleHeader } from "@/components/StatePage/SimpleHeader";
import { SharedListNotFound } from "@/components/SharedListView/SharedListMessages";

export const metadata: Metadata = { title: "Link nije aktivan", robots: { index: false, follow: false } };

export default function SharedListNotFoundPage() {
  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <SimpleHeader width="narrow" />
      <main>
        <SharedListNotFound />
      </main>
    </div>
  );
}
