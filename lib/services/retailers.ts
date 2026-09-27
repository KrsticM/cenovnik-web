import { createClient } from "@/lib/supabase/client";

export type RetailerCount = {
  storeId: string;
  name: string;
  productCount: number;
};

export async function fetchRetailerCounts(
  searchQuery?: string
): Promise<RetailerCount[]> {
  const supabase = createClient();

  // Mock data for now - in production this would call a Postgres function
  // that groups current_prices by retailer with product counts
  const mockRetailers: RetailerCount[] = [
    { storeId: "maxi", name: "Maxi", productCount: 450 },
    { storeId: "mega", name: "Mega Maxi", productCount: 380 },
    { storeId: "supervero", name: "SuperVero", productCount: 220 },
    { storeId: "gomex", name: "Gomex", productCount: 180 },
    { storeId: "univerexport", name: "Univerexport", productCount: 120 },
  ];

  return mockRetailers;
}
