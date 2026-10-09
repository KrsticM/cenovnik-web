import type { SupabaseClient } from "@supabase/supabase-js";
import { MIN_STORES } from "@/lib/storeLimits";

// A failed count (null) lets the user in rather than locking them out.
export async function needsStorePicker(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { count } = await supabase
    .from("user_stores")
    .select("store_id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count !== null && count < MIN_STORES;
}
