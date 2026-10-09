import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
const maybeSingle = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }), insert }),
  }),
}));

const { getShoppingList } = await import("./lists");

const row = { id: "list-1", user_id: "user-1", name: "Moja lista za kupovinu", share_token: null };

beforeEach(() => {
  insert.mockReset();
  maybeSingle.mockReset();
});

describe("getShoppingList", () => {
  it("returns the user's list", async () => {
    maybeSingle.mockResolvedValue({ data: row, error: null });
    expect(await getShoppingList("user-1")).toMatchObject({ id: "list-1", name: "Moja lista za kupovinu" });
  });

  it("fails instead of creating a list when there is none", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(getShoppingList("user-1")).rejects.toThrow("not found");
    expect(insert).not.toHaveBeenCalled();
  });

  it("fails instead of creating a list when the lookup errors", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: new Error("multiple rows") });
    await expect(getShoppingList("user-1")).rejects.toThrow("multiple rows");
    expect(insert).not.toHaveBeenCalled();
  });
});
