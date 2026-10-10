import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { needsStorePicker } from "./storePickerGate";

// Stands in for supabase.from("user_stores").select(...).eq(...), resolving to the given count.
const supabaseWithStoreCount = (count: number | null) =>
  ({ from: () => ({ select: () => ({ eq: async () => ({ count }) }) }) }) as unknown as SupabaseClient;

describe("needsStorePicker", () => {
  it("sends users with fewer than two stores to the picker", async () => {
    expect(await needsStorePicker(supabaseWithStoreCount(1), "user-1")).toBe(true);
  });

  it("lets users with enough stores in", async () => {
    expect(await needsStorePicker(supabaseWithStoreCount(2), "user-1")).toBe(false);
  });

  it("lets the user in when the count fails, rather than locking them out", async () => {
    expect(await needsStorePicker(supabaseWithStoreCount(null), "user-1")).toBe(false);
  });
});
