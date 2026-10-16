"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isValidEmail } from "../signinRules";

export function useEmailStep() {
  const { signInWithEmail } = useAuth();
  const [email, setEmailState] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setEmailError(null);
  }, []);

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
    return true;
  }, [email, signInWithEmail]);

  return { email, setEmail, emailError, sending, sendCode };
}

export type EmailStepState = ReturnType<typeof useEmailStep>;
