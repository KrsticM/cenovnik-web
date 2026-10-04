"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/StatePage/ErrorScreen";

// Errors inside the app keep its header (rendered by the layout above).
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-paper">
      <title>Greška | eCenovnik</title>
      <ErrorScreen code={error.digest} reset={reset} />
    </main>
  );
}
