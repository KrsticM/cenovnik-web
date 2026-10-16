"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CODE_LENGTH, CODE_TTL_MS, RESEND_AFTER_S, afterFailedVerify } from "../signinRules";
import { useCountdown } from "./useCountdown";

export function useOtpVerification(email: string, onVerified: () => void) {
  const { signInWithEmail, verifyOtpCode } = useAuth();
  const { seconds: resendIn, start: startCountdown } = useCountdown();
  const sentAt = useRef(0);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // Called whenever a fresh code has been sent: the old one no longer counts.
  const codeSent = useCallback(
    (message: string | null = null) => {
      sentAt.current = Date.now();
      startCountdown(RESEND_AFTER_S);
      setCode("");
      setCodeError(null);
      setBlocked(false);
      setNotice(message);
    },
    [startCountdown]
  );

  const resend = useCallback(async () => {
    if (resending) return;
    setResending(true);
    const result = await signInWithEmail(email);
    setResending(false);
    if (!result.success) {
      setCodeError(result.msg ?? "Nismo uspeli da pošaljemo novi kod. Pokušaj ponovo.");
      return;
    }
    codeSent("Poslali smo novi kod. Prethodni više ne važi.");
  }, [email, resending, signInWithEmail, codeSent]);

  const verify = useCallback(
    async (value: string) => {
      setVerifying(true);
      const result = await verifyOtpCode(email, value);
      if (result.success) {
        onVerified();
        return;
      }
      setVerifying(false);
      setCode("");
      const failed = afterFailedVerify(result.kind, Date.now() - sentAt.current > CODE_TTL_MS);
      setBlocked(failed.blocked);
      setCodeError(failed.error);
    },
    [email, verifyOtpCode, onVerified]
  );

  const changeCode = useCallback(
    (value: string) => {
      if (blocked || verifying) return;
      const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      setCode(digits);
      setCodeError(null);
      setNotice(null);
      if (digits.length === CODE_LENGTH) void verify(digits);
    },
    [blocked, verifying, verify]
  );

  return {
    code,
    changeCode,
    codeError,
    notice,
    verifying,
    blocked,
    resendIn,
    canResend: resendIn === 0 || blocked,
    resending,
    resend,
    codeSent,
  };
}

export type OtpVerificationState = ReturnType<typeof useOtpVerification>;
