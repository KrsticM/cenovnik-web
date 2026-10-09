import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const updateSession = vi.fn();
vi.mock("@/lib/supabase/proxy", () => ({ updateSession }));

const { proxy } = await import("./proxy");

const visit = (path: string, user: object | null) => {
  updateSession.mockResolvedValue({ response: NextResponse.next(), user });
  return proxy(new NextRequest(`http://app.test${path}`));
};

describe("proxy", () => {
  beforeEach(() => updateSession.mockReset());

  it("answers a signed-out API call with 401 instead of redirecting it to an HTML page", async () => {
    const response = await visit("/api/pretplata", null);
    expect(response.status).toBe(401);
    expect(response.headers.get("location")).toBeNull();
  });

  it("sends a signed-out visitor to sign-in and remembers the page", async () => {
    const response = await visit("/moji-marketi", null);
    expect(response.headers.get("location")).toBe("http://app.test/prijava?next=%2Fmoji-marketi");
  });

  it("lets a signed-in user through", async () => {
    expect((await visit("/moji-marketi", { id: "user-1" })).headers.get("location")).toBeNull();
  });

  it("lets anyone open the public routes", async () => {
    expect((await visit("/prijava", null)).headers.get("location")).toBeNull();
  });
});
