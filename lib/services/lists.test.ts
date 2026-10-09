import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ eq, maybeSingle }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: () => ({ select: () => ({ eq }), insert }) }),
}));

const { getShoppingList } = await import("./lists");

const row = { id: "list-1", user_id: "user-1", name: "Moja lista", is_default: true, share_token: null };

beforeEach(() => {
  eq.mockClear();
  insert.mockReset();
  maybeSingle.mockReset();
});

describe("getShoppingList", () => {
  it("returns the user's default list", async () => {
    maybeSingle.mockResolvedValue({ data: row, error: null });
    expect(await getShoppingList("user-1")).toMatchObject({ id: "list-1", name: "Moja lista", isDefault: true });
  });

  it("asks for the default list only, so extra lists are never picked", async () => {
    maybeSingle.mockResolvedValue({ data: row, error: null });
    await getShoppingList("user-1");
    expect(eq).toHaveBeenCalledWith("is_default", true);
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
