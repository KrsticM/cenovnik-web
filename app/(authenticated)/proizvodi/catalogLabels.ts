import { plural } from "@/lib/formatPrice";
import { COUNT_CAP } from "@/lib/services/products";

const productWord = (n: number) => plural(n, "proizvod", "proizvoda", "proizvoda");

export function countLabel(count: number): string {
  return count > COUNT_CAP
    ? `${COUNT_CAP.toLocaleString("sr-RS")}+ proizvoda`
    : `${count.toLocaleString("sr-RS")} ${productWord(count)}`;
}

export function catalogHeading(liveQuery: string): string {
  return liveQuery ? `Rezultati za „${liveQuery}“` : "Proizvodi";
}

interface SubtitleInput {
  count: number | null;
  loading: boolean;
  liveQuery: string;
  myMarkets: boolean;
}

export function catalogSubtitle({ count, loading, liveQuery, myMarkets }: SubtitleInput): string {
  if (count === null || loading) return "";
  if (liveQuery) {
    const verb = count > COUNT_CAP ? "odgovara" : plural(count, "odgovara", "odgovaraju", "odgovara");
    return `${countLabel(count)} ${verb} pretrazi`;
  }
  return `${countLabel(count)} · cene iz ${myMarkets ? "tvojih" : "svih"} marketa`;
}
