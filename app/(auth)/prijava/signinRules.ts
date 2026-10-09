import type { VerifyFailureKind } from "@/lib/authErrors";

// Mirrors Supabase Auth settings: keep "Email OTP expiration" at 600 s and length at 6.
export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 10 * 60 * 1000;
export const CODE_ATTEMPTS = 5;
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

export type FailedVerify = { attemptsLeft: number; blocked: boolean; error: string };

const attemptsWord = (n: number) => (n === 1 ? "pokušaj" : "pokušaja");

// Only a code Supabase actually rejected costs an attempt; being offline or rate-limited must not.
export function afterFailedVerify(failure: VerifyFailureKind, attemptsLeft: number, codeExpired: boolean): FailedVerify {
  if (failure === "network") {
    return { attemptsLeft, blocked: false, error: "Nema veze sa serverom. Proveri internet i pokušaj ponovo." };
  }
  if (failure === "rate-limited") {
    return { attemptsLeft, blocked: false, error: "Previše pokušaja. Sačekaj malo pa pokušaj ponovo." };
  }
  if (codeExpired) {
    return { attemptsLeft, blocked: true, error: "Kod je istekao. Zatraži novi kod." };
  }
  const left = attemptsLeft - 1;
  if (left <= 0) {
    return { attemptsLeft: 0, blocked: true, error: "Previše pogrešnih pokušaja. Zatraži novi kod." };
  }
  return { attemptsLeft: left, blocked: false, error: `Kod nije tačan. Imaš još ${left} ${attemptsWord(left)}.` };
}
