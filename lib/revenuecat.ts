import { subscriptionDetails, type RevenueCatSubscription, type SubscriptionDetails } from "@/lib/subscriptionDetails";

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

export async function fetchSubscriptionDetails(userId: string, config: RevenueCatConfig): Promise<SubscriptionDetails | null> {
  const response = await revenueCatGet(`${encodeURIComponent(userId)}/subscriptions`, config);
  if (!response) return null;

  const { items } = (await response.json()) as { items?: RevenueCatSubscription[] };
  return subscriptionDetails(items ?? []);
}
