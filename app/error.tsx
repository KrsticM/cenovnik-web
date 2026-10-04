"use client";

import { ErrorScreen } from "@/components/StatePage/ErrorScreen";
import { SimpleHeader } from "@/components/StatePage/SimpleHeader";

export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <SimpleHeader />
      <main>
        <ErrorScreen {...props} />
      </main>
    </div>
  );
}
