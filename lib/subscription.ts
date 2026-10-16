import type { PremiumStore, SubscriptionDetails } from "@/lib/subscriptionDetails";
import { DAY_MS } from "@/lib/time";

export type SubscriptionState =
  | { status: "loading" | "unknown" | "standard" }
  | { status: "premium"; details: SubscriptionDetails | null };

// An answer that is not a clear yes or no is "unknown", never Standard.
export function subscriptionStateFrom(
  body: { isPremium?: boolean | null; subscription?: SubscriptionDetails | null } | null
): SubscriptionState {
  if (typeof body?.isPremium !== "boolean") return { status: "unknown" };
  return body.isPremium ? { status: "premium", details: body.subscription ?? null } : { status: "standard" };
}

const MONTHS_GENITIVE = [
  "januara", "februara", "marta", "aprila", "maja", "juna",
  "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra",
];

const STORE_LABELS: Record<PremiumStore, string> = { app_store: "u App Store-u", google_play: "u Google Play-u" };
const ANY_STORE = "u App Store-u ili Google Play-u";
const OTHER_STORE = "tamo gde si je kupio";

export const CANCEL_STEPS: { store: PremiumStore; text: string }[] = [
  { store: "app_store", text: "Na iPhone-u otvori Podešavanja, dodirni svoje ime, pa Pretplate, i izaberi eCenovnik." },
  { store: "google_play", text: "U Google Play-u dodirni profil, pa Plaćanja i pretplate → Pretplate, i izaberi eCenovnik." },
];

export function formatLongDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getDate()}. ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}.`;
}

const PERIODS = { monthly: "Mesečno", yearly: "Godišnje" };
const VERBS = { renews: "obnavlja se", ends: "ističe", unclear: "aktivan do" };

function dateLine({ plan, renewal, endsAt }: SubscriptionDetails): string {
  const verb = VERBS[renewal];
  const sentence = `${verb} ${formatLongDate(endsAt)}`;
  return plan ? `${PERIODS[plan]} · ${sentence}` : sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function storeLabel(store: SubscriptionDetails["store"] | undefined): string {
  if (store === "other") return OTHER_STORE;
  return store ? STORE_LABELS[store] : ANY_STORE;
}

export const TRIAL_DAYS = 14;

const startOfDay = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

// Calendar days, so "today" is the last day however late in the day it is.
export function daysUntil(timestamp: number, now: number): number {
  return Math.max(0, Math.round((startOfDay(timestamp) - startOfDay(now)) / DAY_MS));
}

const daysLabel = (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "dan" : "dana"}`;

function trialCopy({ renewal, endsAt, store }: SubscriptionDetails, now: number) {
  const left = daysUntil(endsAt, now);
  const cancelled = renewal === "ends";
  const lastDay = left === 0;
  const where = storeLabel(store);
  const end = formatLongDate(endsAt);

  const dateLine = cancelled
    ? `Probni period ističe ${end} · bez naplate`
    : lastDay
      ? "Probni period se završava danas, posle toga počinje naplata."
      : `Besplatno još ${daysLabel(left)} · prva naplata ${end}`;
  const manageNote = cancelled
    ? `Ništa neće biti naplaćeno. Nakon završetka probnog perioda prelaziš na Standardno članstvo. Ukoliko se predomisliš, Premium članstvo možeš ponovo da aktiviraš ${where}.`
    : lastDay
      ? `Ukoliko želiš da odustaneš od benefita Premium članstva, otkaži danas ${where}.`
      : `Ukoliko želiš da odustaneš od članstva, uradi to najkasnije 24 sata pre naredne naplate ${where}.`;

  return {
    left,
    lastDay,
    dateLine,
    manageNote,
    progress: Math.min(Math.max((TRIAL_DAYS - left) / TRIAL_DAYS, 0), 1),
    deleteNote: `Brisanje naloga ne otkazuje probni period. Otkaži ga ${where}, inače naplata počinje ${end}`,
  };
}

export function subscriptionCopy(details: SubscriptionDetails | null, now: number) {
  const cancelled = details?.renewal === "ends";
  const trial = details?.trial ? trialCopy(details, now) : null;
  const where = storeLabel(details?.store);
  const howSteps =
    details?.store === "other" ? [] : details?.store ? CANCEL_STEPS.filter(({ store }) => store === details.store) : CANCEL_STEPS;
  return {
    cancelled,
    badge: cancelled ? ("cancelled" as const) : trial ? (trial.lastDay ? ("lastDay" as const) : ("trial" as const)) : null,
    dateLine: details ? (trial?.dateLine ?? dateLine(details)) : null,
    // 0 to 1 through the trial; none once it is cancelled, because nothing is coming.
    trialProgress: trial && !cancelled ? trial.progress : null,
    manageNote:
      trial?.manageNote ??
      (cancelled ? `Premium ostaje aktivan do isteka. Ponovo ga aktiviraš ${where}.` : `Pretplatom upravljaš ${where}.`),
    howSteps,
    showHow: !cancelled && howSteps.length > 0,
    // On the last day the way to cancel is the most useful thing on the card.
    howOpenByDefault: !!trial?.lastDay && !cancelled,
    howFoot: trial
      ? "Posle otkazivanja Premium ostaje aktivan do kraja probnog perioda."
      : "Posle otkazivanja Premium ostaje aktivan do kraja plaćenog perioda.",
    deleteNote:
      trial?.deleteNote ?? `Brisanje naloga ne otkazuje Premium. Pretplatu otkaži ${where}, inače će se i dalje naplaćivati.`,
  };
}

export type SubscriptionCopy = ReturnType<typeof subscriptionCopy>;
