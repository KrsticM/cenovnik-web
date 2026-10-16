type ActiveEntitlements = { items?: { entitlement_id: string; expires_at: number | null }[] };

export type RevenueCatConfig = { secret: string; projectId: string };

// null for a customer RevenueCat has never seen (e.g. a web-only user); throws for any other failure, so an outage never reads as "not premium".
async function revenueCatGet(path: string, { secret, projectId }: RevenueCatConfig): Promise<Response | null> {
  const url = `https://api.revenuecat.com/v2/projects/${encodeURIComponent(projectId)}/customers/${path}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`RevenueCat responded with ${response.status}`);
  return response;
}

// Premium = one active entitlement (app user id = Supabase user id).
export async function fetchIsPremium(userId: string, config: RevenueCatConfig): Promise<boolean> {
  const response = await revenueCatGet(`${encodeURIComponent(userId)}/active_entitlements?limit=1`, config);
  if (!response) return false;

  const { items } = (await response.json()) as ActiveEntitlements;
  return (items ?? []).some(({ expires_at }) => expires_at === null || expires_at > Date.now());
}

export type PremiumStore = "app_store" | "google_play";
export type SubscriptionDetails = {
  // null when the period is not a normal month or year, e.g. while a free trial is running.
  plan: "monthly" | "yearly" | null;
  // "other" is a subscription that is not from an app store (web billing, promotional); null is unknown.
  store: PremiumStore | "other" | null;
  // "ends": Premium stays active until `endsAt` and will not renew; "unclear": a billing issue, a pause or a price change to confirm.
  renewal: "renews" | "ends" | "unclear";
  endsAt: number;
};

type Subscription = {
  gives_access?: boolean;
  status?: string;
  store?: string;
  auto_renewal_status?: string;
  current_period_starts_at?: number | null;
  current_period_ends_at?: number | null;
};

const STORES: Record<string, PremiumStore> = { app_store: "app_store", mac_app_store: "app_store", play_store: "google_play" };
const RENEWING = ["will_renew", "has_already_renewed", "will_change_product"];
const DAY = 86_400_000;

// The subscription has no plan field, so the plan is read from the dates of the current period.
function planFrom(startsAt: number | null | undefined, endsAt: number): SubscriptionDetails["plan"] {
  const days = startsAt ? (endsAt - startsAt) / DAY : 0;
  if (days >= 25 && days <= 40) return "monthly";
  if (days >= 330 && days <= 400) return "yearly";
  return null;
}

function renewalFrom({ status, auto_renewal_status }: Subscription): SubscriptionDetails["renewal"] {
  if (status && !["active", "trialing"].includes(status)) return "unclear";
  if (auto_renewal_status === "will_not_renew") return "ends";
  return RENEWING.includes(auto_renewal_status ?? "") ? "renews" : "unclear";
}

export function subscriptionDetails(items: Subscription[]): SubscriptionDetails | null {
  const current = items
    .filter(({ gives_access, current_period_ends_at }) => gives_access && current_period_ends_at)
    .sort((a, b) => b.current_period_ends_at! - a.current_period_ends_at!)[0];
  if (!current) return null;

  const endsAt = current.current_period_ends_at!;
  return {
    plan: planFrom(current.current_period_starts_at, endsAt),
    store: current.store ? (STORES[current.store] ?? "other") : null,
    renewal: renewalFrom(current),
    endsAt,
  };
}

export async function fetchSubscriptionDetails(userId: string, config: RevenueCatConfig): Promise<SubscriptionDetails | null> {
  const response = await revenueCatGet(`${encodeURIComponent(userId)}/subscriptions`, config);
  if (!response) return null;

  const { items } = (await response.json()) as { items?: Subscription[] };
  return subscriptionDetails(items ?? []);
}
