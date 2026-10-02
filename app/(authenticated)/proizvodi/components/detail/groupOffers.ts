import type { ProductOffer } from "@/lib/services/products";

export type GroupStore = {
  id: string;
  address: string | null;
  regularPrice: number;
  isDeal: boolean;
  discountPct: number;
};

export type OfferGroup = {
  key: string;
  retailerName: string;
  price: number;
  stores: GroupStore[];
  // Any store in the group sells at a discount.
  isDeal: boolean;
  maxDiscountPct: number;
  // Shared pre-discount price, or null when stores differ (then only the max discount is shown).
  regularPrice: number | null;
};

// One row per chain and paid price: its stores collapse into "N lokacija", even when their
// regular prices (and so their discounts) differ.
export function groupOffers(offers: ProductOffer[]): OfferGroup[] {
  const byKey = new Map<string, { retailerName: string; price: number; stores: GroupStore[] }>();
  for (const offer of offers) {
    const key = `${offer.retailerId}|${offer.price}`;
    let entry = byKey.get(key);
    if (!entry) {
      entry = { retailerName: offer.retailerName, price: offer.price, stores: [] };
      byKey.set(key, entry);
    }
    entry.stores.push({
      id: offer.storeId,
      address: offer.address,
      regularPrice: offer.regularPrice,
      isDeal: offer.isDeal,
      discountPct: offer.isDeal ? Math.round((1 - offer.price / offer.regularPrice) * 100) : 0,
    });
  }

  return [...byKey.entries()]
    .map(([key, { retailerName, price, stores }]) => {
      const allDeals = stores.every((s) => s.isDeal);
      const sameRegular = stores.every((s) => s.regularPrice === stores[0].regularPrice);
      return {
        key,
        retailerName,
        price,
        stores,
        isDeal: stores.some((s) => s.isDeal),
        maxDiscountPct: Math.max(...stores.map((s) => s.discountPct)),
        regularPrice: allDeals && sameRegular ? stores[0].regularPrice : null,
      };
    })
    .sort((a, b) => a.price - b.price);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
