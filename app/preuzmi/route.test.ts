import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/support";
import { GET } from "./route";

const visit = (userAgent: string) => GET(new NextRequest("http://localhost/preuzmi", { headers: { "user-agent": userAgent } }));

describe("GET /preuzmi", () => {
  it("sends each phone to its own store", async () => {
    expect((await visit("Mozilla/5.0 (Linux; Android 14)")).headers.get("location")).toBe(PLAY_STORE_URL);
    expect((await visit("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).headers.get("location")).toBe(APP_STORE_URL);
  });

  it("is never cached for another device", async () => {
    const response = await visit("Mozilla/5.0 (Macintosh)");
    expect(response.status).toBe(307);
    expect(response.headers.get("vary")).toBe("User-Agent");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
