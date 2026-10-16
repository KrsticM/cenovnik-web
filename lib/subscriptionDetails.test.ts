import { describe, expect, it } from "vitest";
import { subscriptionDetails } from "./subscriptionDetails";
import { DAY_MS as DAY } from "./time";

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

  it("accepts a month or a year with a few days of slack and nothing outside", () => {
    const plan = (days: number) => subscriptionDetails([item({ current_period_starts_at: END - days * DAY })])?.plan;
    expect([plan(25), plan(28), plan(31), plan(40)]).toEqual(["monthly", "monthly", "monthly", "monthly"]);
    expect([plan(330), plan(365), plan(366), plan(400)]).toEqual(["yearly", "yearly", "yearly", "yearly"]);
    expect([plan(24), plan(41), plan(329), plan(401)]).toEqual([null, null, null, null]);
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

  it("reads renewal from RevenueCat even when the status is missing", () => {
    expect(subscriptionDetails([item({ status: undefined })])?.renewal).toBe("renews");
    expect(subscriptionDetails([item({ status: undefined, auto_renewal_status: "will_not_renew" })])?.renewal).toBe("ends");
    expect(subscriptionDetails([item({ status: undefined, auto_renewal_status: undefined })])?.renewal).toBe("unclear");
  });

  it("flags a running free trial", () => {
    expect(subscriptionDetails([item()])?.trial).toBe(false);
    expect(subscriptionDetails([item({ status: "trialing" })])?.trial).toBe(true);
  });

  it("ignores subscriptions that no longer give access and picks the latest one", () => {
    expect(subscriptionDetails([item({ gives_access: false })])).toBeNull();
    expect(subscriptionDetails([item({ current_period_ends_at: END - 10 * DAY }), item()])?.endsAt).toBe(END);
  });
});
