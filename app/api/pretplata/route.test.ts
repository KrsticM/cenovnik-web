import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

const fetchIsPremium = vi.fn();
vi.mock("@/lib/revenuecat", () => ({ fetchIsPremium }));

const { GET } = await import("./route");

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
});

describe("GET /api/pretplata", () => {
  it("rejects signed-out users", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await GET()).status).toBe(401);
  });

  it("returns and briefly caches a successful lookup", async () => {
    fetchIsPremium.mockResolvedValue(true);
    const response = await GET();
    expect(await response.json()).toEqual({ isPremium: true });
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=300");
    expect(fetchIsPremium).toHaveBeenCalledWith("user-1", { secret: "sk_test", projectId: "proj_test" });
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
