import { describe, expect, it } from "vitest";
import { fetchSubscriptionDetails, subscriptionDetails } from "./revenuecat";
import { formatLongDate, subscriptionCopy, subscriptionStateFrom } from "./subscription";

const DAY = 86_400_000;
const END = new Date(2027, 2, 12, 12).getTime();
const item = (over: object = {}) => ({
  gives_access: true,
  store: "app_store",
  auto_renewal_status: "will_renew",
  current_period_starts_at: END - 365 * DAY,
  current_period_ends_at: END,
  ...over,
});

describe("subscriptionDetails", () => {
  it("reads yearly vs monthly from the length of the period", () => {
    expect(subscriptionDetails([item()])?.plan).toBe("yearly");
    expect(subscriptionDetails([item({ current_period_starts_at: END - 30 * DAY })])?.plan).toBe("monthly");
  });

  it("does not guess a plan when the period is not a month or a year, like a 14 day trial", () => {
    for (const days of [14, 90]) {
      expect(subscriptionDetails([item({ current_period_starts_at: END - days * DAY })])?.plan).toBeNull();
    }
    expect(subscriptionDetails([item({ current_period_starts_at: null })])?.plan).toBeNull();
  });

  it("maps the store and treats anything that is not an app store as other", () => {
    expect(subscriptionDetails([item({ store: "play_store" })])?.store).toBe("google_play");
    expect(subscriptionDetails([item({ store: "mac_app_store" })])?.store).toBe("app_store");
    expect(subscriptionDetails([item({ store: "stripe" })])?.store).toBe("other");
    expect(subscriptionDetails([item({ store: undefined })])?.store).toBeNull();
  });

  it("only says a plan renews when RevenueCat says so", () => {
    expect(subscriptionDetails([item()])?.renewal).toBe("renews");
    expect(subscriptionDetails([item({ auto_renewal_status: "will_not_renew" })])?.renewal).toBe("ends");
    expect(subscriptionDetails([item({ auto_renewal_status: "requires_price_increase_consent" })])?.renewal).toBe("unclear");
    expect(subscriptionDetails([item({ status: "in_grace_period" })])?.renewal).toBe("unclear");
    expect(subscriptionDetails([item({ status: "trialing" })])?.renewal).toBe("renews");
  });

  it("ignores subscriptions that no longer give access and picks the latest one", () => {
    expect(subscriptionDetails([item({ gives_access: false })])).toBeNull();
    expect(subscriptionDetails([item({ current_period_ends_at: END - 10 * DAY }), item()])?.endsAt).toBe(END);
  });
});

describe("fetchSubscriptionDetails", () => {
  it("throws instead of answering null when RevenueCat fails", async () => {
    globalThis.fetch = (async () => new Response("{}", { status: 503 })) as typeof fetch;
    await expect(fetchSubscriptionDetails("u", { secret: "s", projectId: "p" })).rejects.toThrow("503");
  });

  it("answers null for a customer RevenueCat has never seen", async () => {
    globalThis.fetch = (async () => new Response("{}", { status: 404 })) as typeof fetch;
    expect(await fetchSubscriptionDetails("u", { secret: "s", projectId: "p" })).toBeNull();
  });
});

describe("subscriptionCopy", () => {
  const base = { plan: "yearly", store: "app_store", renewal: "renews", endsAt: END } as const;

  it("formats dates in the genitive", () => {
    expect(formatLongDate(END)).toBe("12. marta 2027.");
  });

  it("describes an active plan and a cancelled one", () => {
    const active = subscriptionCopy(base);
    expect(active.dateLine).toBe("Godišnje · obnavlja se 12. marta 2027.");
    expect(active.manageNote).toBe("Pretplatom upravljaš u App Store-u.");
    expect(active.howSteps).toHaveLength(1);

    const cancelled = subscriptionCopy({ ...base, plan: "monthly", store: "google_play", renewal: "ends" });
    expect(cancelled.dateLine).toBe("Mesečno · ističe 12. marta 2027.");
    expect(cancelled.showHow).toBe(false);
  });

  it("drops the period when the plan is unknown and the verb when renewal is unclear", () => {
    expect(subscriptionCopy({ ...base, plan: null }).dateLine).toBe("Obnavlja se 12. marta 2027.");
    expect(subscriptionCopy({ ...base, renewal: "unclear" }).dateLine).toBe("Godišnje · aktivan do 12. marta 2027.");
  });

  it("does not send a Stripe or promotional plan to the app stores", () => {
    const copy = subscriptionCopy({ ...base, store: "other" });
    expect(copy.manageNote).toBe("Pretplatom upravljaš tamo gde si je kupio.");
    expect(copy.deleteNote).toContain("otkaži tamo gde si je kupio");
    expect(copy.howSteps).toEqual([]);
    expect(copy.showHow).toBe(false);
  });

  it("falls back to both stores when the details or the store are unknown", () => {
    for (const copy of [subscriptionCopy(null), subscriptionCopy({ ...base, store: null })]) {
      expect(copy.manageNote).toContain("u App Store-u ili Google Play-u");
      expect(copy.howSteps).toHaveLength(2);
    }
    expect(subscriptionCopy(null).dateLine).toBeNull();
  });
});

describe("subscriptionStateFrom", () => {
  const details = { plan: "yearly", store: "app_store", renewal: "renews", endsAt: END } as const;

  it("reads a clear yes or no", () => {
    expect(subscriptionStateFrom({ isPremium: true, subscription: details })).toEqual({ status: "premium", details });
    expect(subscriptionStateFrom({ isPremium: true })).toEqual({ status: "premium", details: null });
    expect(subscriptionStateFrom({ isPremium: false })).toEqual({ status: "standard" });
  });

  it("never reads a failed or missing answer as Standard", () => {
    expect(subscriptionStateFrom(null)).toEqual({ status: "unknown" });
    expect(subscriptionStateFrom({ isPremium: null })).toEqual({ status: "unknown" });
    expect(subscriptionStateFrom({})).toEqual({ status: "unknown" });
  });
});
