"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function PrijavaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);

  const error = searchParams.get("error");
  const next = searchParams.get("next");

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    const result = await signInWithGoogle(next || undefined);
    if (!result.success) {
      setLoading(false);
    }
  }, [signInWithGoogle, next]);

  const handleAppleSignIn = useCallback(async () => {
    setLoading(true);
    const result = await signInWithApple(next || undefined);
    if (!result.success) {
      setLoading(false);
    }
  }, [signInWithApple, next]);

  const emailLink =
    next !== null ? `/prijava/email?next=${encodeURIComponent(next || "")}` : "/prijava/email";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-sans text-2xl font-semibold text-foreground">Prijava</h1>
        </div>

        {error === "auth_failed" && (
          <div className="rounded bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Prijava nije uspela. Pokušajte ponovo.
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleAppleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Učitavam..." : "Nastavi sa Apple nalogom"}
          </Button>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Učitavam..." : "Nastavi sa Google nalogom"}
          </Button>

          <Link href={emailLink} className="block">
            <Button variant="outline" className="w-full">
              Nastavi sa Email nalogom
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PrijavaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Učitavam...</div>}>
      <PrijavaContent />
    </Suspense>
  );
}
