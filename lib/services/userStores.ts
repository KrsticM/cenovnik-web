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
