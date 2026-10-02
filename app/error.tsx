"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/StatePage/ErrorScreen";
import { LogoHeader } from "@/components/StatePage/LogoHeader";

// Errors outside the app shell (sign-in, shared list page).
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <title>Greška | eCenovnik</title>
      <LogoHeader />
      <main>
        <ErrorScreen code={error.digest} reset={reset} />
      </main>
    </div>
  );
}
