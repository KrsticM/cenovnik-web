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

const STORE_LABELS: Record<PremiumStore, string> = { app_store: "u App Store-u", google_play: "u Google Play-u" };
const ANY_STORE = "u App Store-u ili Google Play-u, gde si je kupio";
const OTHER_STORE = "tamo gde si je kupio";

export const CANCEL_STEPS: { store: PremiumStore; text: string }[] = [
  { store: "app_store", text: "Na iPhone-u otvori Podešavanja, dodirni svoje ime, pa Pretplate, i izaberi eCenovnik." },
  { store: "google_play", text: "U Google Play prodavnici dodirni profil, pa Plaćanja i pretplate → Pretplate, i izaberi eCenovnik." },
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

export function subscriptionCopy(details: SubscriptionDetails | null) {
  const cancelled = details?.renewal === "ends";
  const where = storeLabel(details?.store);
  const howSteps =
    details?.store === "other" ? [] : details?.store ? CANCEL_STEPS.filter(({ store }) => store === details.store) : CANCEL_STEPS;
  return {
    cancelled,
    dateLine: details ? dateLine(details) : null,
    manageNote: cancelled
      ? `Premium ostaje aktivan do isteka. Ponovo ga aktiviraš ${where}.`
      : `Pretplatom upravljaš ${where}.`,
    howSteps,
    showHow: !cancelled && howSteps.length > 0,
    deleteNote: `Brisanje naloga ne otkazuje Premium. Pretplatu otkaži ${where}, inače će se i dalje naplaćivati.`,
  };
}

export type SubscriptionCopy = ReturnType<typeof subscriptionCopy>;
