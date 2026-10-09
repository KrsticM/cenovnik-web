import { createClient } from "@/lib/supabase/client";

type UserStoreRow = {
  store_id: string;
};

export async function getUserStoreIds(userId: string): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_stores")
    .select("store_id")
    .eq("user_id", userId);

  if (error) throw error;

  return ((data as UserStoreRow[] | null) ?? []).map((row) => row.store_id);
}

// Same two steps as the mobile app: drop stores no longer picked, then add the new ones.
export async function saveUserStoreIds(userId: string, storeIds: string[]): Promise<void> {
  if (storeIds.length === 0) throw new Error("At least one store must be selected.");

  const supabase = createClient();
  const inList = storeIds.map((id) => `"${id}"`).join(",");

  const { error: deleteError } = await supabase
    .from("user_stores")
    .delete()
    .eq("user_id", userId)
    .not("store_id", "in", `(${inList})`);
  if (deleteError) throw deleteError;

  const { error: upsertError } = await supabase
    .from("user_stores")
    .upsert(
      storeIds.map((store_id) => ({ user_id: userId, store_id })),
      { onConflict: "user_id,store_id", ignoreDuplicates: true }
    );
  if (upsertError) throw upsertError;
}
