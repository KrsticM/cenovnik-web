import { describe, expect, it, vi } from "vitest";
import { deleteAccountVia } from "./account";

describe("deleteAccountVia", () => {
  it("throws and keeps the session when the edge function fails", async () => {
    const signOut = vi.fn();
    const failure = { message: "boom" };
    await expect(deleteAccountVia(async () => ({ error: failure }), signOut)).rejects.toBe(failure);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signs out locally after a successful delete", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    await deleteAccountVia(async () => ({ error: null }), signOut);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("still succeeds when the local sign-out fails, since the account is already gone", async () => {
    await expect(
      deleteAccountVia(async () => ({ error: null }), () => Promise.reject(new Error("storage")))
    ).resolves.toBeUndefined();
  });
});
