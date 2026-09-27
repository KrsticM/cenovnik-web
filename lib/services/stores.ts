import { createClient } from "@/lib/supabase/client";

export type Store = {
  id: string;
  retailerId: string;
  retailerName: string;
  address: string | null;
};

type RetailerRef = { name: string };

type StoreRow = {
  id: string;
  retailer_id: string;
  address: string | null;
  retailers: RetailerRef | RetailerRef[] | null;
};

// Store ids are long slugs; chunking keeps the `in` filter well under URL length limits.
const IDS_PER_REQUEST = 150;

export async function fetchStoresByIds(ids: string[]): Promise<Map<string, Store>> {
  if (ids.length === 0) return new Map();

  const supabase = createClient();
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += IDS_PER_REQUEST) {
    chunks.push(ids.slice(i, i + IDS_PER_REQUEST));
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, retailer_id, address, retailers ( name )")
        .in("id", chunk);
      if (error) throw error;
      return (data as StoreRow[] | null) ?? [];
    })
  );

  return new Map(
    results.flat().map((row) => {
      const retailer = Array.isArray(row.retailers) ? row.retailers[0] : row.retailers;
      return [
        row.id,
        {
          id: row.id,
          retailerId: row.retailer_id,
          retailerName: retailer?.name ?? "",
          address: row.address,
        },
      ];
    })
  );
}
