import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const block = "animate-[pulse_1.4s_ease-in-out_infinite] bg-skeleton";
const bar = cn(block, "block rounded-[6px]");

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <Card aria-hidden="true" className={cn("overflow-hidden rounded-2xl border-line bg-white shadow-none", className)}>
      <Skeleton className={cn(block, "block aspect-square max-h-[340px] w-full rounded-none")} />
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3.5">
        <Skeleton className={cn(bar, "h-3 w-[90%]")} />
        <Skeleton className={cn(bar, "h-3 w-[60%]")} />
        <Skeleton className={cn(bar, "mt-2 h-[18px] w-[42%]")} />
      </div>
    </Card>
  );
}
