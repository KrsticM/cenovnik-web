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

  const signInWithGoogle = useCallback(async (next?: string): Promise<AuthActionResult> => {
    try {
      const supabase = createClient();
      const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
      if (next) redirectUrl.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl.toString() },
      });

      if (error) return { success: false, msg: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, msg: error instanceof Error ? error.message : "Sign in failed" };
    }
  }, []);

  const signInWithApple = useCallback(async (next?: string): Promise<AuthActionResult> => {
    try {
      const supabase = createClient();
      const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
      if (next) redirectUrl.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: redirectUrl.toString() },
      });

      if (error) return { success: false, msg: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, msg: error instanceof Error ? error.message : "Sign in failed" };
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string): Promise<AuthActionResult> => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) return { success: false, msg: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, msg: error instanceof Error ? error.message : "Failed to send code" };
    }
  }, []);

  const verifyOtpCode = useCallback(async (email: string, code: string): Promise<AuthActionResult> => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) return { success: false, msg: "Kod nije ispravan ili je istekao." };
      return { success: true };
    } catch (error) {
      return { success: false, msg: "Kod nije ispravan ili je istekao." };
    }
  }, []);

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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signInWithEmail, verifyOtpCode, signOutUser, deleteAccount }}>
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
