import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchIsPremium } from "./revenuecat";

const DAY = 24 * 60 * 60 * 1000;
const config = { secret: "sk_test", projectId: "proj1" };
const entitlement = (expires_at: number | null) => ({
  entitlement_id: "entl1",
  expires_at,
  object: "customer.active_entitlement",
});

function respondWith(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("fetchIsPremium", () => {
  it("is premium with an active entitlement", async () => {
    respondWith({ items: [entitlement(Date.now() + DAY)], next_page: null });
    expect(await fetchIsPremium("user-1", config)).toBe(true);
  });

  it("is premium with an entitlement that never expires", async () => {
    respondWith({ items: [entitlement(null)] });
    expect(await fetchIsPremium("user-1", config)).toBe(true);
  });

  it("is not premium without entitlements", async () => {
    respondWith({ items: [], next_page: null });
    expect(await fetchIsPremium("user-1", config)).toBe(false);
  });

  it("is not premium when the only entitlement has expired", async () => {
    respondWith({ items: [entitlement(Date.now() - DAY)] });
    expect(await fetchIsPremium("user-1", config)).toBe(false);
  });

  it("is not premium for a customer RevenueCat has never seen", async () => {
    respondWith({ message: "not found" }, 404);
    expect(await fetchIsPremium("user-1", config)).toBe(false);
  });

  it("throws instead of answering false when RevenueCat fails", async () => {
    respondWith({ message: "unavailable" }, 503);
    await expect(fetchIsPremium("user-1", config)).rejects.toThrow("503");
  });

  it("calls the v2 endpoint with a bearer token and encoded ids", async () => {
    const fetchMock = respondWith({ items: [] });
    await fetchIsPremium("a/b c", { secret: "sk_test", projectId: "proj 1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.revenuecat.com/v2/projects/proj%201/customers/a%2Fb%20c/active_entitlements?limit=1"
    );
    expect(init.headers.Authorization).toBe("Bearer sk_test");
  });
});
