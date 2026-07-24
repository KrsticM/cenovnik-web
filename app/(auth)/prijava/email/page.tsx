"use client";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "email" | "code";

export default function EmailSignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStep("code");
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/proizvodi");
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.container}>
        <Link href="/prijava" style={styles.backLink}>
          ← Nazad
        </Link>

        <h1 style={styles.title}>
          {step === "email" ? "Unesite e-mail" : "Unesite kod"}
        </h1>

        {error && <div style={styles.error}>{error}</div>}

        {step === "email" ? (
          <form onSubmit={handleSendCode} style={styles.form}>
            <input
              type="email"
              placeholder="vasa@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Slanje..." : "Pošalji kod"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} style={styles.form}>
            <div style={styles.codeInputContainer}>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                style={styles.codeInput}
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{
                ...styles.button,
                opacity: loading || code.length !== 6 ? 0.6 : 1,
                cursor: loading || code.length !== 6 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verifikujem..." : "Verifikuj kod"}
            </button>
          </form>
        )}

        <p style={styles.note}>
          {step === "email"
            ? "Poslali smo kod na vašu e-mail adresu."
            : "Kod je odslat na vašu e-mail adresu."}
        </p>
      </div>
    </div>
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
  backLink: {
    display: "inline-block",
    marginBottom: "24px",
    color: "var(--brand)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
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
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as React.CSSProperties,
  input: {
    minHeight: "48px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid var(--line)",
    fontSize: "16px",
    fontFamily: "inherit",
  } as React.CSSProperties,
  codeInputContainer: {
    display: "flex",
    justifyContent: "center",
  } as React.CSSProperties,
  codeInput: {
    width: "120px",
    minHeight: "48px",
    padding: "12px",
    borderRadius: "12px",
    border: "2px solid var(--brand)",
    fontSize: "24px",
    fontWeight: 600,
    textAlign: "center",
    letterSpacing: "0.5em",
    fontFamily: "monospace",
  } as React.CSSProperties,
  button: {
    minHeight: "48px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: 600,
    backgroundColor: "var(--brand)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.18s ease",
  } as React.CSSProperties,
  note: {
    marginTop: "24px",
    fontSize: "13px",
    color: "var(--muted)",
    textAlign: "center",
  } as React.CSSProperties,
};
