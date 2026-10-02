import type { Metadata } from "next";
import { SharedHeader } from "@/components/StatePage/SharedHeader";
import { SharedListNotFound } from "@/components/SharedListView/SharedListMessages";

export const metadata: Metadata = { title: "Link nije aktivan", robots: { index: false, follow: false } };

export default function SharedListNotFoundPage() {
  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <SharedHeader status="none" />
      <main>
        <SharedListNotFound />
      </main>
    </div>
  );
}
