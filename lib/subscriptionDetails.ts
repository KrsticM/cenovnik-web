import { DAY_MS } from "@/lib/time";

export type PremiumStore = "app_store" | "google_play";
export type SubscriptionDetails = {
  // null when the period is not a normal month or year, e.g. while a free trial is running.
  plan: "monthly" | "yearly" | null;
  // "other" is a subscription that is not from an app store (web billing, promotional); null is unknown.
  store: PremiumStore | "other" | null;
  // "ends": Premium stays active until `endsAt` and will not renew; "unclear": a billing issue, a pause or a price change to confirm.
  renewal: "renews" | "ends" | "unclear";
  // The free trial is running: `endsAt` is the day it ends and billing starts.
  trial: boolean;
  endsAt: number;
};

// The fields of a RevenueCat v2 subscription that the dialog reads.
export type RevenueCatSubscription = {
  gives_access?: boolean;
  status?: string;
  store?: string;
  auto_renewal_status?: string;
  current_period_starts_at?: number | null;
  current_period_ends_at?: number | null;
};

const STORES: Record<string, PremiumStore> = { app_store: "app_store", mac_app_store: "app_store", play_store: "google_play" };
// A billing period counts as a month or a year with a few days of slack either way.
const MONTH_DAYS = { min: 25, max: 40 };
const YEAR_DAYS = { min: 330, max: 400 };
const within = (days: number, { min, max }: { min: number; max: number }) => days >= min && days <= max;
const RENEWING = ["will_renew", "has_already_renewed", "will_change_product"];

// The subscription has no plan field, so the plan is read from the dates of the current period.
function planFrom(startsAt: number | null | undefined, endsAt: number): SubscriptionDetails["plan"] {
  const days = startsAt ? (endsAt - startsAt) / DAY_MS : 0;
  if (within(days, MONTH_DAYS)) return "monthly";
  if (within(days, YEAR_DAYS)) return "yearly";
  return null;
}

function renewalFrom({ status, auto_renewal_status }: RevenueCatSubscription): SubscriptionDetails["renewal"] {
  if (status && !["active", "trialing"].includes(status)) return "unclear";
  if (auto_renewal_status === "will_not_renew") return "ends";
  return RENEWING.includes(auto_renewal_status ?? "") ? "renews" : "unclear";
}

export function subscriptionDetails(items: RevenueCatSubscription[]): SubscriptionDetails | null {
  const current = items
    .filter(({ gives_access, current_period_ends_at }) => gives_access && current_period_ends_at)
    .sort((a, b) => b.current_period_ends_at! - a.current_period_ends_at!)[0];
  if (!current) return null;

  const endsAt = current.current_period_ends_at!;
  return {
    plan: planFrom(current.current_period_starts_at, endsAt),
    store: current.store ? (STORES[current.store] ?? "other") : null,
    renewal: renewalFrom(current),
    trial: current.status === "trialing",
    endsAt,
  };
}
