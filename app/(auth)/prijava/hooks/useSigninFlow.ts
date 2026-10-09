"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getUserStoreIds } from "@/lib/services/userStores";
import { MIN_STORES } from "@/lib/storeLimits";
import { useStorePicker } from "@/components/StorePicker/useStorePicker";
import { useEmailCode } from "./useEmailCode";

export type SigninStep = "start" | "email" | "code" | "done" | "markets" | "ready";
export type OAuthProvider = "apple" | "google";
export type OAuthError = OAuthProvider | "unknown";

const DONE_REDIRECT_MS = 900;
const READY_REDIRECT_MS = 1200;

interface SigninFlowOptions {
  next: string;
  initialStep: SigninStep;
  initialUserId: string | null;
  initialOAuthError: OAuthError | null;
}

export function useSigninFlow({ next, initialStep, initialUserId, initialOAuthError }: SigninFlowOptions) {
  const { user, signInWithApple, signInWithGoogle } = useAuth();
  const [step, setStep] = useState<SigninStep>(initialStep);
  const [oauth, setOauth] = useState<OAuthProvider | null>(null);
  const [oauthError, setOauthError] = useState<OAuthError | null>(initialOAuthError);
  const userId = user?.id ?? initialUserId;
  const picker = useStorePicker(step === "markets" ? userId : null);
  const nextParam = next === "/proizvodi" ? undefined : next;
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  // A full page load after sign-in, so the app layout and its store check see the new session.
  const leaveTo = useCallback((path: string, delay: number) => {
    leaveTimer.current = setTimeout(() => window.location.assign(path), delay);
  }, []);

  const afterSignIn = useCallback(async () => {
    const {
      data: { user: signedIn },
    } = await createClient().auth.getUser();
    const storeIds = signedIn ? await getUserStoreIds(signedIn.id).catch(() => null) : null;
    if (storeIds && storeIds.length < MIN_STORES) {
      setStep("markets");
      return;
    }
    setStep("done");
    leaveTo(next, DONE_REDIRECT_MS);
  }, [next, leaveTo]);

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

  const saveMarkets = useCallback(async () => {
    if (await picker.save()) {
      setStep("ready");
      leaveTo(next, READY_REDIRECT_MS);
    }
  }, [picker, next, leaveTo]);

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
    picker,
    saveMarkets,
  };
}
