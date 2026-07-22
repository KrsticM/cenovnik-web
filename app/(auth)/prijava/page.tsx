"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/AuthShell/AuthShell";
import { SocialSignInButton } from "@/components/SocialSignInButton/SocialSignInButton";
import { useAuth } from "@/contexts/AuthContext";

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
    <AuthShell>
      <div style={{ width: "100%" }}>
        {error && (
          <div style={styles.error}>
            Greška pri prijavi. Pokušajte ponovo.
          </div>
        )}

        <div style={styles.buttonGroup}>
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

          <Link href={`/prijava/email${next ? `?next=${encodeURIComponent(next)}` : ""}`} style={{ textDecoration: "none", width: "100%" }}>
            <SocialSignInButton
              variant="email"
              label="Nastavi sa Email nalogom"
              onClick={() => {}}
              disabled={loading}
            />
          </Link>
        </div>

        <p style={styles.note}>
          Prijavljivanjem prihvatate{" "}
          <a href="https://www.ecenovnik.app/uslovi-koriscenja" target="_blank" rel="noopener noreferrer" style={styles.link}>
            uslove korišćenja
          </a>{" "}
          i{" "}
          <a href="https://www.ecenovnik.app/privatnost" target="_blank" rel="noopener noreferrer" style={styles.link}>
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
    <Suspense fallback={<div style={styles.shell}><p>Učitavam...</p></div>}>
      <PrijavaContent />
    </Suspense>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "var(--paper)",
  } as React.CSSProperties,
  error: {
    padding: "12px 16px",
    marginBottom: "20px",
    borderRadius: "12px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    fontSize: "14px",
  } as React.CSSProperties,
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  note: {
    marginTop: "24px",
    fontSize: "13px",
    color: "var(--muted)",
    textAlign: "center" as const,
  } as React.CSSProperties,
  link: {
    color: "var(--brand)",
    textDecoration: "underline",
  } as React.CSSProperties,
};
