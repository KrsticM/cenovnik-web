import { plural } from "@/lib/formatPrice";
import { OpenMyMarketsButton } from "@/components/MyMarketsDialog/OpenMyMarketsButton";

export function MyMarketsChip({ count }: { count: number }) {
  return (
    <OpenMyMarketsButton
      variant="ghost"
      className="h-7 gap-1.5 rounded-[14px] bg-sand px-2.5 text-xs font-medium text-sage-dark hover:bg-sand-dark hover:text-sage-dark"
      aria-label={`Moji marketi, ${count} ${plural(count, "market", "marketa", "marketa")} — izmeni`}
    >
      <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sage" />
      Moji marketi · {count}
    </OpenMyMarketsButton>
  );
}
