import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

const { GET } = await import("./route");

const callback = async (query: string) => {
  const response = await GET(new NextRequest(`http://app.test/auth/callback?${query}`));
  return new URL(response.headers.get("location")!);
};

beforeEach(() => {
  exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  exchangeCodeForSession.mockReset();
  vi.restoreAllMocks();
});

describe("GET /auth/callback", () => {
  it("sends a signed-in user on to the page they came from", async () => {
    expect((await callback("code=abc&next=%2Flista")).pathname).toBe("/lista");
  });

  it("ignores a return path that leaves the site", async () => {
    const url = await callback("code=abc&next=%2F%2Fevil.com");
    expect(url.origin).toBe("http://app.test");
    expect(url.pathname).toBe("/proizvodi");
  });

  it("reports a failed code exchange and keeps the provider", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: { message: "bad code" } });
    const url = await callback("code=abc&provider=google");
    expect(url.pathname + url.search).toBe("/prijava?error=auth_failed&provider=google");
  });

  it("treats cancelling at the provider as a quiet return to sign-in", async () => {
    const url = await callback("error=access_denied");
    expect(url.pathname + url.search).toBe("/prijava");
  });
});
