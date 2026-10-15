import type { PremiumStore, SubscriptionDetails } from "@/lib/revenuecat";

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

const STORE_LABELS: Record<PremiumStore, string> = { app_store: "App Store-u", google_play: "Google Play-u" };
const ANY_STORE = "App Store-u ili Google Play-u, gde si je kupio";

export const CANCEL_STEPS: { store: PremiumStore; text: string }[] = [
  { store: "app_store", text: "Na iPhone-u otvori Podešavanja, dodirni svoje ime, pa Pretplate, i izaberi eCenovnik." },
  { store: "google_play", text: "U Google Play prodavnici dodirni profil, pa Plaćanja i pretplate → Pretplate, i izaberi eCenovnik." },
];

export function formatLongDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getDate()}. ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}.`;
}

export function storeLabel(store: PremiumStore | null | undefined): string {
  return store ? STORE_LABELS[store] : ANY_STORE;
}

export function subscriptionCopy(details: SubscriptionDetails | null) {
  const cancelled = details?.cancelled ?? false;
  const where = storeLabel(details?.store);
  const period = details ? (details.plan === "monthly" ? "Mesečno" : "Godišnje") : null;
  const when = details ? (cancelled ? "ističe" : "obnavlja se") : null;
  return {
    cancelled,
    dateLine: details ? `${period} · ${when} ${formatLongDate(details.endsAt)}` : null,
    manageNote: cancelled
      ? `Premium ostaje aktivan do isteka. Ponovo ga aktiviraš u ${where}.`
      : `Pretplatom upravljaš u ${where}.`,
    // Where a cancelled plan can be bought again, and the active one cancelled, is the store it came from.
    howSteps: details?.store ? CANCEL_STEPS.filter(({ store }) => store === details.store) : CANCEL_STEPS,
    showHow: !cancelled,
    deleteNote: `Brisanje naloga ne otkazuje Premium. Pretplatu otkaži u ${where}, inače će se i dalje naplaćivati.`,
  };
}
