// Price comparison needs at least two stores. Limits are enforced in the UI only for now.
export const MIN_STORES = 2;
export const STORE_LIMIT_STANDARD = 10;

// Unknown Premium status imposes no limit, so a slow or failing check never blocks a Premium user.
export function storeLimit(isPremium: boolean | null): number {
  return isPremium === false ? STORE_LIMIT_STANDARD : Infinity;
}
