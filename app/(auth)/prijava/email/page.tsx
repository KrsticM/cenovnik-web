"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AuthShell } from "@/components/AuthShell/AuthShell";
import { OtpCodeInput } from "@/components/OtpCodeInput/OtpCodeInput";
import { useAuth } from "@/contexts/AuthContext";

type Step = "email" | "code";

function EmailSignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, verifyOtpCode } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const next = searchParams.get("next");

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signInWithEmail(email);
    if (result.success) {
      setStep("code");
      setResendTimer(60);
    } else {
      setError(result.msg || "Slanje koda nije uspelo. Pokušajte ponovo.");
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Kod mora imati 6 cifara.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await verifyOtpCode(email, code);
    if (result.success) {
      router.push(next || "/proizvodi");
    } else {
      setError(result.msg || "Verifikacija nije uspela. Pokušajte ponovo.");
    }
    setLoading(false);
  };

  return (
    <AuthShell>
      <div style={{ width: "100%" }}>
        <Link href={`/prijava${next ? `?next=${encodeURIComponent(next)}` : ""}`} style={styles.backLink}>
          ← Nazad
        </Link>

        <h1 style={styles.title}>
          {step === "email" ? "Unesite email adresu" : "Unesite kod"}
        </h1>

        <p style={styles.subtitle}>
          {step === "email"
            ? "Poslaćemo vam jednokratni kod za prijavu."
            : `Kod je poslat na ${email}.`}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {step === "email" ? (
          <form onSubmit={handleSendCode} style={styles.form}>
            <input
              type="email"
              placeholder="vasa@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !email}
              style={{
                ...styles.button,
                opacity: loading || !email ? 0.6 : 1,
                cursor: loading || !email ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Slanje..." : "Pošalji kod"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} style={styles.form}>
            <OtpCodeInput value={code} onChange={setCode} disabled={loading} />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{
                ...styles.button,
                opacity: loading || code.length !== 6 ? 0.6 : 1,
                cursor: loading || code.length !== 6 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verifikujem..." : "Prijavi se"}
            </button>

            <div style={styles.actions}>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={resendTimer > 0 || loading}
                style={styles.actionButton}
              >
                {resendTimer > 0 ? `Pošalji ponovo za ${resendTimer}s` : "Pošalji kod ponovo"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setEmail("");
                  setError("");
                  setResendTimer(0);
                }}
                disabled={loading}
                style={styles.actionButton}
              >
                Promeni email adresu
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export default function EmailSignInPage() {
  return (
    <Suspense fallback={<div style={styles.shell}><p>Učitavam...</p></div>}>
      <EmailSignInContent />
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
  backLink: {
    display: "inline-block",
    marginBottom: "24px",
    color: "var(--brand)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  } as React.CSSProperties,
  title: {
    margin: "0 0 12px 0",
    fontSize: "24px",
    fontWeight: 600,
    color: "var(--ink)",
  } as React.CSSProperties,
  subtitle: {
    margin: "0 0 20px 0",
    color: "var(--muted)",
    fontSize: "14px",
    lineHeight: 1.5,
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
  },
  input: {
    minHeight: "48px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid var(--line)",
    fontSize: "16px",
    fontFamily: "inherit",
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
  actions: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    marginTop: "12px",
  },
  actionButton: {
    padding: "8px 12px",
    backgroundColor: "transparent",
    color: "var(--brand)",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
};
