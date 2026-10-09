"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailCode } from "./useEmailCode";

export type SigninStep = "start" | "email" | "code" | "done";
export type OAuthProvider = "apple" | "google";
export type OAuthError = OAuthProvider | "unknown";

const DONE_REDIRECT_MS = 900;

interface SigninFlowOptions {
  next: string;
  initialOAuthError: OAuthError | null;
}

export function useSigninFlow({ next, initialOAuthError }: SigninFlowOptions) {
  const { signInWithApple, signInWithGoogle } = useAuth();
  const [step, setStep] = useState<SigninStep>("start");
  const [oauth, setOauth] = useState<OAuthProvider | null>(null);
  const [oauthError, setOauthError] = useState<OAuthError | null>(initialOAuthError);
  const nextParam = next === "/proizvodi" ? undefined : next;
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  // A full page load after sign-in, so the app layout sees the new session (and asks for the stores if needed).
  const afterSignIn = useCallback(() => {
    setStep("done");
    leaveTimer.current = setTimeout(() => window.location.assign(next), DONE_REDIRECT_MS);
  }, [next]);

  const email = useEmailCode(afterSignIn);

  // Coming back from the provider with the browser's back button restores this page as it was.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => event.persisted && setOauth(null);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const startOAuth = useCallback(
    async (provider: OAuthProvider) => {
      if (oauth) return;
      setOauth(provider);
      setOauthError(null);
      const result = provider === "apple" ? await signInWithApple(nextParam) : await signInWithGoogle(nextParam);
      if (!result.success) {
        setOauth(null);
        setOauthError(provider);
      }
    },
    [oauth, signInWithApple, signInWithGoogle, nextParam]
  );

  const sendCode = useCallback(async () => {
    if (await email.sendCode()) setStep("code");
  }, [email]);

  return {
    step,
    toStart: () => setStep("start"),
    toEmail: () => {
      setOauthError(null);
      setStep("email");
    },
    oauth,
    oauthError,
    startOAuth,
    email,
    sendCode,
  };
}
