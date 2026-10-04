"use client";

import { ErrorScreen } from "@/components/StatePage/ErrorScreen";

export default function AppError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="bg-paper">
      <ErrorScreen {...props} />
    </main>
  );
}
