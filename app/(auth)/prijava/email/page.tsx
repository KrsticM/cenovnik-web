"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function EmailOtpContent() {
  const searchParams = useSearchParams();
  const { signInWithEmail, verifyOtpCode } = useAuth();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const next = searchParams.get("next");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSendCode = useCallback(async () => {
    if (!email) {
      setError("Unesite e-mail adresu.");
      return;
    }
    setSendLoading(true);
    setError("");
    const result = await signInWithEmail(email);
    if (result.success) {
      setStep("otp");
      setResendCooldown(60);
    } else {
      setError(result.msg || "Greška pri slanju koda.");
    }
    setSendLoading(false);
  }, [email, signInWithEmail]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Kod mora imati 6 cifara.");
      return;
    }
    setVerifyLoading(true);
    setError("");
    const result = await verifyOtpCode(email, otp);
    if (result.success) {
      window.location.href = next || "/proizvodi";
    } else {
      setError(result.msg || "Greška pri proveri koda.");
    }
    setVerifyLoading(false);
  }, [otp, email, verifyOtpCode, next]);

  useEffect(() => {
    if (step === "otp" && otp.length === 6) {
      handleVerifyOtp();
    }
  }, [otp, step, handleVerifyOtp]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {step === "email" ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="font-sans text-2xl font-semibold text-foreground">Unesite e-mail</h1>
              <p className="text-sm text-muted-foreground">
                Poslaćemo vam kod za prijavu
              </p>
            </div>

            {error && (
              <div className="rounded bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoFocus
                  placeholder="vas@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  disabled={sendLoading}
                />
              </div>

              <Button
                onClick={handleSendCode}
                disabled={sendLoading || resendCooldown > 0}
                className="w-full"
              >
                {sendLoading ? "Slanje..." : resendCooldown > 0 ? `Pošalji kod (${resendCooldown}s)` : "Pošalji kod"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h1 className="font-sans text-2xl font-semibold text-foreground">Unesite kod</h1>
              <p className="text-sm text-muted-foreground">
                Kod je poslat na <span className="font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className="rounded bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-cifren kod</Label>
                <Input
                  id="otp"
                  type="text"
                  autoFocus
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setOtp(digits);
                    setError("");
                  }}
                  disabled={verifyLoading}
                  className="tracking-widest"
                />
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={verifyLoading || otp.length !== 6 || sendLoading}
                className="w-full"
              >
                {verifyLoading ? "Učitavam..." : "Prijavi se"}
              </Button>
            </div>

            <div className="space-y-2 text-center text-sm">
              <button
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                  setSendLoading(false);
                  setVerifyLoading(false);
                }}
                className="text-primary hover:underline"
              >
                Promeni e-mail
              </button>

              <button
                onClick={handleSendCode}
                disabled={resendCooldown > 0 || sendLoading || verifyLoading}
                className="text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                Pošalji kod ponovo{resendCooldown > 0 ? ` (${resendCooldown}s)` : ""}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function EmailOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">Učitavam...</div>
      }
    >
      <EmailOtpContent />
    </Suspense>
  );
}
