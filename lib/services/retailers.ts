import { createClient } from "@/lib/supabase/client";

export type RetailerStore = { id: string; name: string; address: string | null };

export type Retailer = { id: string; name: string; stores: RetailerStore[] };

type RetailerRow = {
  id: string;
  name: string;
  stores: RetailerStore[] | null;
};

export async function fetchRetailersWithStores(): Promise<Retailer[]> {
  const { data, error } = await createClient()
    .from("retailers")
    .select("id, name, stores ( id, name, address )")
    .order("name")
    .order("name", { referencedTable: "stores" });

  if (error) throw error;

  return ((data as RetailerRow[] | null) ?? [])
    .map((row) => ({ id: row.id, name: row.name, stores: row.stores ?? [] }))
    .filter((retailer) => retailer.stores.length > 0);
}
