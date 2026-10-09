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
