type ActiveEntitlements = { items?: { entitlement_id: string; expires_at: number | null }[] };

export type RevenueCatConfig = { secret: string; projectId: string };

// Premium = one active entitlement (app user id = Supabase user id); throws when RevenueCat can't answer, so an outage never reads as "not premium".
export async function fetchIsPremium(userId: string, { secret, projectId }: RevenueCatConfig): Promise<boolean> {
  const url =
    `https://api.revenuecat.com/v2/projects/${encodeURIComponent(projectId)}` +
    `/customers/${encodeURIComponent(userId)}/active_entitlements?limit=1`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" });

  // A customer RevenueCat has never seen (e.g. a web-only user) simply isn't premium.
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`RevenueCat responded with ${response.status}`);

  const { items } = (await response.json()) as ActiveEntitlements;
  return (items ?? []).some(({ expires_at }) => expires_at === null || expires_at > Date.now());
}

export type PremiumStore = "app_store" | "google_play";
export type SubscriptionDetails = {
  plan: "monthly" | "yearly";
  store: PremiumStore | null;
  // Premium stays active until `endsAt`, but will not renew.
  cancelled: boolean;
  endsAt: number;
};

type Subscription = {
  gives_access?: boolean;
  store?: string;
  auto_renewal_status?: string;
  current_period_starts_at?: number | null;
  current_period_ends_at?: number | null;
};

const STORES: Record<string, PremiumStore> = { app_store: "app_store", mac_app_store: "app_store", play_store: "google_play" };
const YEARLY_AFTER_DAYS = 200;

// The v2 subscription has no billing period field, so it is read from the length of the current period.
export function subscriptionDetails(items: Subscription[]): SubscriptionDetails | null {
  const current = items
    .filter(({ gives_access, current_period_ends_at }) => gives_access && current_period_ends_at)
    .sort((a, b) => b.current_period_ends_at! - a.current_period_ends_at!)[0];
  if (!current) return null;

  const endsAt = current.current_period_ends_at!;
  const periodDays = current.current_period_starts_at ? (endsAt - current.current_period_starts_at) / 86_400_000 : 0;
  return {
    plan: periodDays > YEARLY_AFTER_DAYS ? "yearly" : "monthly",
    store: STORES[current.store ?? ""] ?? null,
    cancelled: current.auto_renewal_status === "will_not_renew",
    endsAt,
  };
}

export async function fetchSubscriptionDetails(
  userId: string,
  { secret, projectId }: RevenueCatConfig
): Promise<SubscriptionDetails | null> {
  const url =
    `https://api.revenuecat.com/v2/projects/${encodeURIComponent(projectId)}` +
    `/customers/${encodeURIComponent(userId)}/subscriptions`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`RevenueCat responded with ${response.status}`);

  const { items } = (await response.json()) as { items?: Subscription[] };
  return subscriptionDetails(items ?? []);
}
