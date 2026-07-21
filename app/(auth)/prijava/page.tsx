"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function PrijavaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const error = searchParams.get("error");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Sign in error:", error);
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Sign in error:", error);
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.container}>
        <h1 style={styles.title}>Prijava</h1>

        {error && (
          <div style={styles.error}>
            Greška pri prijavi. Pokušajte ponovo.
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.buttonGoogle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Učitavam..." : "Prijava sa Google"}
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.buttonApple,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Učitavam..." : "Prijava sa Apple"}
          </button>

          <Link href="/prijava/email" style={styles.emailLink}>
            <button style={{ ...styles.button, ...styles.buttonEmail }}>
              Prijava sa e-mailom
            </button>
          </Link>
        </div>

        <p style={styles.note}>
          Kreirajući nalog, pristajete našim Uslovima servisa.
        </p>
      </div>
    </div>
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
  container: {
    width: "100%",
    maxWidth: "400px",
  } as React.CSSProperties,
  title: {
    margin: "0 0 30px 0",
    fontSize: "32px",
    fontWeight: 600,
    color: "var(--ink)",
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
  button: {
    minHeight: "48px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.18s ease",
  } as React.CSSProperties,
  buttonGoogle: {
    backgroundColor: "var(--brand)",
    color: "white",
  } as React.CSSProperties,
  buttonApple: {
    backgroundColor: "#000",
    color: "white",
  } as React.CSSProperties,
  buttonEmail: {
    backgroundColor: "var(--surface)",
    color: "var(--brand)",
  } as React.CSSProperties,
  emailLink: {
    textDecoration: "none",
  } as React.CSSProperties,
  note: {
    marginTop: "24px",
    fontSize: "13px",
    color: "var(--muted)",
    textAlign: "center",
  } as React.CSSProperties,
};
