"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import { AuthShell } from "@/components/AuthShell/AuthShell";
import { OtpCodeInput } from "@/components/OtpCodeInput/OtpCodeInput";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

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
  const [displayError, setDisplayError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const next = searchParams.get("next");

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (loading && step === "code") {
      setError("");
    }
  }, [loading, step]);

  useEffect(() => {
    if (error && step === "code" && !loading) {
      const timer = setTimeout(() => setDisplayError(error), 80);
      return () => clearTimeout(timer);
    } else {
      setDisplayError("");
    }
  }, [error, step, loading]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setError("");
  }, []);

  useEffect(() => {
    if (step === "code" && code.length === 6 && !loading && !error) {
      handleVerifyCode(new Event("submit") as any);
    }
  }, [code, step, loading, error]);

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
    <AuthShell showBranding={false}>
      <div className={styles.container}>
        <Link href={`/prijava${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={styles.backLink}>
          <svg
            className={styles.backIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="14"
            height="14"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Nazad
        </Link>

        {step === "code" && (
          <div className={styles.badge}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={styles.badgeIcon}>
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
        )}

        <h1 className={styles.title}>
          {step === "email" ? "Unesite email adresu" : "Unesite kod"}
        </h1>

        <p className={styles.subtitle}>
          {step === "email"
            ? "Poslaćemo vam jednokratni kod za prijavu."
            : (
                <>
                  Kod je poslat na <b>{email}</b>.{' '}
                  <button
                    type="button"
                    className={styles.inlineLink}
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setError("");
                      setResendTimer(0);
                    }}
                  >
                    Promeni
                  </button>
                </>
              )}
        </p>

        {displayError && <div className={styles.error}>{displayError}</div>}

        {step === "email" ? (
          <form onSubmit={handleSendCode} className={styles.form}>
            <input
              type="email"
              placeholder="vasa@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !email}
              className={`${styles.button} ${loading || !email ? styles.disabled : ""}`}
            >
              {loading ? "Slanje..." : "Pošalji kod"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className={styles.form}>
            <OtpCodeInput value={code} onChange={handleCodeChange} disabled={loading} />
            <div className={styles.resendRow}>
              {resendTimer > 0 ? (
                <span className={styles.resendText}>Pošalji kod ponovo za {resendTimer}s</span>
              ) : (
                <>
                  <span className={styles.resendText}>Niste dobili kod?</span>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className={styles.inlineLink}
                  >
                    Pošalji ponovo
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export default function EmailSignInPage() {
  return (
    <Suspense fallback={<div className={styles.fallback}><p>Učitavam...</p></div>}>
      <EmailSignInContent />
    </Suspense>
  );
}
