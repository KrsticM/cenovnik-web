import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

const fetchIsPremium = vi.fn();
const fetchSubscriptionDetails = vi.fn();
vi.mock("@/lib/revenuecat", () => ({ fetchIsPremium, fetchSubscriptionDetails }));

const { GET: handle } = await import("./route");
const GET = (query = "") => handle(new Request(`http://localhost/api/pretplata${query}`));

beforeEach(() => {
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  vi.stubEnv("REVENUECAT_SECRET_KEY", "sk_test");
  vi.stubEnv("REVENUECAT_PROJECT_ID", "proj_test");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  fetchIsPremium.mockReset();
  fetchSubscriptionDetails.mockReset();
});

describe("GET /api/pretplata", () => {
  it("rejects signed-out users", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await GET()).status).toBe(401);
  });

  it("returns a successful lookup without letting the browser cache it", async () => {
    const subscription = { plan: "yearly", store: "app_store", renewal: "renews", trial: false, endsAt: 1 };
    fetchIsPremium.mockResolvedValue(true);
    fetchSubscriptionDetails.mockResolvedValue(subscription);
    const response = await GET();
    expect(await response.json()).toEqual({ isPremium: true, subscription });
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(fetchIsPremium).toHaveBeenCalledWith("user-1", { secret: "sk_test", projectId: "proj_test" });
  });

  it("keeps a known Premium status when only the subscription details fail", async () => {
    fetchIsPremium.mockResolvedValue(true);
    fetchSubscriptionDetails.mockRejectedValue(new Error("RevenueCat responded with 500"));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ isPremium: true, subscription: null });
  });

  it("skips the details call when only the Premium flag is asked for", async () => {
    fetchIsPremium.mockResolvedValue(true);
    expect(await (await GET("?details=0")).json()).toEqual({ isPremium: true, subscription: null });
    expect(fetchSubscriptionDetails).not.toHaveBeenCalled();
  });

  it("does not look up details for a Standard account", async () => {
    fetchIsPremium.mockResolvedValue(false);
    expect(await (await GET()).json()).toEqual({ isPremium: false, subscription: null });
    expect(fetchSubscriptionDetails).not.toHaveBeenCalled();
  });

  it("answers unknown and never caches when RevenueCat fails", async () => {
    fetchIsPremium.mockRejectedValue(new Error("RevenueCat responded with 500"));
    const response = await GET();
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ isPremium: null });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("answers unknown and never caches when RevenueCat is not configured", async () => {
    vi.stubEnv("REVENUECAT_PROJECT_ID", "");
    const response = await GET();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ isPremium: null });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetchIsPremium).not.toHaveBeenCalled();
  });
});
