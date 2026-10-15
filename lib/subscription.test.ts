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

  it("maps stores and flags a plan that will not renew as cancelled", () => {
    expect(subscriptionDetails([item({ store: "play_store", auto_renewal_status: "will_not_renew" })])).toMatchObject({
      store: "google_play",
      cancelled: true,
    });
    expect(subscriptionDetails([item({ store: "stripe" })])?.store).toBeNull();
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
});

describe("subscriptionCopy", () => {
  it("formats dates in the genitive", () => {
    expect(formatLongDate(END)).toBe("12. marta 2027.");
  });

  it("describes an active plan and a cancelled one", () => {
    const active = subscriptionCopy({ plan: "yearly", store: "app_store", cancelled: false, endsAt: END });
    expect(active.dateLine).toBe("Godišnje · obnavlja se 12. marta 2027.");
    expect(active.manageNote).toBe("Pretplatom upravljaš u App Store-u.");
    expect(active.howSteps).toHaveLength(1);

    const cancelled = subscriptionCopy({ plan: "monthly", store: "google_play", cancelled: true, endsAt: END });
    expect(cancelled.dateLine).toBe("Mesečno · ističe 12. marta 2027.");
    expect(cancelled.showHow).toBe(false);
  });

  it("falls back to both stores when the details or the store are unknown", () => {
    const copy = subscriptionCopy(null);
    expect(copy.dateLine).toBeNull();
    expect(copy.manageNote).toContain("App Store-u ili Google Play-u");
    expect(copy.howSteps).toHaveLength(2);
  });
});

describe("subscriptionStateFrom", () => {
  const details = { plan: "yearly", store: "app_store", cancelled: false, endsAt: END } as const;

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
