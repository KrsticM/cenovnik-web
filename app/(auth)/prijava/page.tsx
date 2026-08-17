"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/AuthShell/AuthShell";
import { SocialSignInButton } from "@/components/SocialSignInButton/SocialSignInButton";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

function PrijavaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const error = searchParams.get("error");
  const next = searchParams.get("next");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await signInWithGoogle(next || undefined);
    if (!result.success) {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    const result = await signInWithApple(next || undefined);
    if (!result.success) {
      setLoading(false);
    }
  };

  return (
    <AuthShell showBranding>
      <div className={styles.container}>
        {error && (
          <div className={styles.error}>
            Greška pri prijavi. Pokušajte ponovo.
          </div>
        )}

        <div className={styles.buttonGroup}>
          <SocialSignInButton
            variant="apple"
            label="Nastavi sa Apple nalogom"
            onClick={handleAppleSignIn}
            disabled={loading}
            loading={loading}
          />

          <SocialSignInButton
            variant="google"
            label="Nastavi sa Google nalogom"
            onClick={handleGoogleSignIn}
            disabled={loading}
            loading={loading}
          />

          <Link href={`/prijava/email${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={styles.emailLink}>
            <SocialSignInButton
              variant="email"
              label="Nastavi sa Email nalogom"
              onClick={() => {}}
              disabled={loading}
            />
          </Link>
        </div>

        <p className={styles.note}>
          Prijavljivanjem prihvatate{" "}
          <a href="https://www.ecenovnik.app/uslovi-koriscenja" target="_blank" rel="noopener noreferrer" className={styles.link}>
            uslove korišćenja
          </a>{" "}
          i{" "}
          <a href="https://www.ecenovnik.app/privatnost" target="_blank" rel="noopener noreferrer" className={styles.link}>
            politiku privatnosti
          </a>
          .
        </p>
      </div>
    </AuthShell>
  );
}

export default function PrijavaPage() {
  return (
    <Suspense fallback={<div className={styles.fallback}><p>Učitavam...</p></div>}>
      <PrijavaContent />
    </Suspense>
  );
}
