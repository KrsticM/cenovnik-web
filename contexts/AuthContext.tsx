"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthActionResult {
  success: boolean;
  msg?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (next?: string) => Promise<AuthActionResult>;
  signInWithApple: (next?: string) => Promise<AuthActionResult>;
  signInWithEmail: (email: string) => Promise<AuthActionResult>;
  verifyOtpCode: (email: string, code: string) => Promise<AuthActionResult>;
  signOutUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function translateAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string } | undefined)?.code;

  if (code === "over_email_send_rate_limit" || /only request this after/i.test(message)) {
    const match = message.match(/(\d+)\s*seconds?/i);
    return match
      ? `Iz bezbednosnih razloga, novi kod možete zatražiti za ${match[1]} sekundi.`
      : "Iz bezbednosnih razloga, sačekajte malo pre nego što zatražite novi kod.";
  }

  if (code === "email_address_invalid" || /invalid email/i.test(message)) {
    return "Unesite ispravnu e-mail adresu.";
  }

  return "Došlo je do greške. Pokušajte ponovo.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const supabase = createClient();

    // Check initial session
    const checkSession = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser || null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(
    async (next?: string): Promise<AuthActionResult> => {
      try {
        const redirectUrl = new URL(
          `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`
        );
        if (next) redirectUrl.searchParams.set("next", next);
        const { error } = await createClient().auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirectUrl.toString() },
        });
        if (error) return { success: false, msg: translateAuthError(error) };
        return { success: true };
      } catch (error) {
        console.error("Sign in with Google error:", error);
        return { success: false, msg: translateAuthError(error) };
      }
    },
    []
  );

  const signInWithApple = useCallback(
    async (next?: string): Promise<AuthActionResult> => {
      try {
        const redirectUrl = new URL(
          `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`
        );
        if (next) redirectUrl.searchParams.set("next", next);
        const { error } = await createClient().auth.signInWithOAuth({
          provider: "apple",
          options: { redirectTo: redirectUrl.toString() },
        });
        if (error) return { success: false, msg: translateAuthError(error) };
        return { success: true };
      } catch (error) {
        console.error("Sign in with Apple error:", error);
        return { success: false, msg: translateAuthError(error) };
      }
    },
    []
  );

  const signInWithEmail = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      try {
        const { error } = await createClient().auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });
        if (error) return { success: false, msg: translateAuthError(error) };
        return { success: true };
      } catch (error) {
        console.error("Sign in with email error:", error);
        return { success: false, msg: translateAuthError(error) };
      }
    },
    []
  );

  const verifyOtpCode = useCallback(
    async (email: string, code: string): Promise<AuthActionResult> => {
      try {
        const { error } = await createClient().auth.verifyOtp({
          email,
          token: code,
          type: "email",
        });
        if (error)
          return { success: false, msg: "Kod nije ispravan ili je istekao." };
        return { success: true };
      } catch (error) {
        console.error("Verify OTP error:", error);
        return {
          success: false,
          msg: "Kod nije ispravan ili je istekao.",
        };
      }
    },
    []
  );

  const signOutUser = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/prijava");
  }, [router]);

  const deleteAccount = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.functions.invoke("delete-account", {
        method: "POST",
      });
      setUser(null);
      router.push("/prijava");
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithApple,
        signInWithEmail,
        verifyOtpCode,
        signOutUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
