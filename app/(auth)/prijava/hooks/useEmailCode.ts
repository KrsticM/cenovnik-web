"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CODE_ATTEMPTS, CODE_LENGTH, CODE_TTL_MS, RESEND_AFTER_S, afterFailedVerify, isValidEmail } from "../signinRules";
import { useCountdown } from "./useCountdown";

export function useEmailCode(onVerified: () => void) {
  const { signInWithEmail, verifyOtpCode } = useAuth();
  const { seconds: resendIn, start: startCountdown } = useCountdown();
  const sentAt = useRef(0);
  const [email, setEmailState] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(CODE_ATTEMPTS);
  const [blocked, setBlocked] = useState(false);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setEmailError(null);
  }, []);

  const resetCode = useCallback(() => {
    sentAt.current = Date.now();
    startCountdown(RESEND_AFTER_S);
    setCode("");
    setCodeError(null);
    setAttempts(CODE_ATTEMPTS);
    setBlocked(false);
  }, [startCountdown]);

  const sendCode = useCallback(async (): Promise<boolean> => {
    const value = email.trim();
    if (!isValidEmail(value)) {
      setEmailError("Proveri e-mail adresu, izgleda da nešto nedostaje.");
      return false;
    }
    setSending(true);
    setEmailState(value);
    const result = await signInWithEmail(value);
    setSending(false);
    if (!result.success) {
      setEmailError(result.msg ?? "Nismo uspeli da pošaljemo kod. Pokušaj ponovo.");
      return false;
    }
    resetCode();
    setNotice(null);
    return true;
  }, [email, signInWithEmail, resetCode]);

  const resend = useCallback(async () => {
    if (resending) return;
    setResending(true);
    const result = await signInWithEmail(email);
    setResending(false);
    if (!result.success) {
      setCodeError(result.msg ?? "Nismo uspeli da pošaljemo novi kod. Pokušaj ponovo.");
      return;
    }
    resetCode();
    setNotice("Poslali smo novi kod. Prethodni više ne važi.");
  }, [email, resending, signInWithEmail, resetCode]);

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
      const next = afterFailedVerify(result.kind, attempts, Date.now() - sentAt.current > CODE_TTL_MS);
      setAttempts(next.attemptsLeft);
      setBlocked(next.blocked);
      setCodeError(next.error);
    },
    [email, verifyOtpCode, onVerified, attempts]
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
    email,
    setEmail,
    emailError,
    sending,
    resending,
    sendCode,
    code,
    changeCode,
    codeError,
    notice,
    verifying,
    blocked,
    resendIn,
    canResend: resendIn === 0 || blocked,
    resend,
  };
}

export type EmailCodeState = ReturnType<typeof useEmailCode>;
