import type { VerifyFailureKind } from "@/lib/authErrors";

// Mirrors Supabase Auth settings: keep "Email OTP expiration" at 600 s and length at 6.
export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 10 * 60 * 1000;
export const RESEND_AFTER_S = 60;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

const PAGE_NAMES: [prefix: string, name: string][] = [
  ["/lista", "tvoju listu"],
  ["/moji-marketi", "Moje markete"],
  ["/podesavanja", "Podešavanja"],
  ["/premium", "Premium članstvo"],
];

// Product links only carry an id, so they get a generic name.
export function describeNext(next: string): string | null {
  if (next === "/proizvodi") return null;
  if (next.startsWith("/proizvodi")) return next.includes("proizvod=") ? "proizvod koji si otvorio" : "proizvode";
  return PAGE_NAMES.find(([prefix]) => next.startsWith(prefix))?.[1] ?? "stranicu koju si otvorio";
}

export type FailedVerify = { blocked: boolean; error: string };

// Supabase enforces the real attempt limit and answers with a rate-limit error, so no count is promised here.
export function afterFailedVerify(failure: VerifyFailureKind, codeExpired: boolean): FailedVerify {
  if (failure === "network") {
    return { blocked: false, error: "Nema veze sa serverom. Proveri internet i pokušaj ponovo." };
  }
  if (failure === "rate-limited") {
    return { blocked: false, error: "Previše pokušaja. Sačekaj malo pa pokušaj ponovo." };
  }
  if (codeExpired) {
    return { blocked: true, error: "Kod je istekao. Zatraži novi kod." };
  }
  return { blocked: false, error: "Kod nije tačan. Pokušaj ponovo." };
}
