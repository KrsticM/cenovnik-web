import Link from "next/link";
import { plural } from "@/lib/formatPrice";
import { Button } from "@/components/ui/button";

export function MyMarketsChip({ count }: { count: number }) {
  return (
    <Button
      asChild
      variant="ghost"
      className="h-7 gap-1.5 rounded-[14px] bg-sand px-2.5 text-xs font-medium text-sage-dark hover:bg-sand-dark hover:text-sage-dark"
    >
      <Link href="/prodavnice" aria-label={`Moji marketi, ${count} ${plural(count, "prodavnica", "prodavnice", "prodavnica")} — izmeni`}>
        <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sage" />
        Moji marketi · {count}
      </Link>
    </Button>
  );
}
