import type { SupabaseClient } from "@supabase/supabase-js";
import { MIN_STORES } from "@/lib/storeLimits";

export const STORE_PICKER_STEP = "marketi";

// The store picker lives inside the sign-in flow; `next` is where to go once the user has saved.
export function storePickerPath(next = "/proizvodi"): string {
  const params = new URLSearchParams({ korak: STORE_PICKER_STEP });
  if (next !== "/proizvodi") params.set("next", next);
  return `/prijava?${params}`;
}

// A failed count (null) lets the user in rather than locking them out.
export async function needsStorePicker(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { count } = await supabase
    .from("user_stores")
    .select("store_id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count !== null && count < MIN_STORES;
}
