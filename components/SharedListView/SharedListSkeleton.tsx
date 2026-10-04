import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const block = "rounded-none bg-skeleton";
const ROW_WIDTHS = ["70%", "55%", "78%", "48%"];

// Loading placeholder shaped like the real list card (no spinner).
export function SharedListSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Učitavanje liste…</span>
      <Card
        aria-hidden="true"
        className="animate-[pulse_1.6s_ease-in-out_infinite] overflow-hidden rounded-[18px] border-line bg-white shadow-none"
      >
        <div className="p-[clamp(20px,4vw,28px)]">
          <Skeleton className={`${block} h-3 w-[110px] rounded-[6px]`} />
          <Skeleton className={`${block} mt-3.5 h-[30px] w-[62%] rounded-[8px]`} />
          <Skeleton className={`${block} mt-3 h-3.5 w-[120px] rounded-[7px]`} />
          <Skeleton className={`${block} mt-6 h-4 w-[48%] rounded-[8px]`} />
          <Skeleton className={`${block} mt-3.5 h-1.5 w-full rounded-[3px]`} />
        </div>
        {ROW_WIDTHS.map((width) => (
          <div key={width} className="flex min-h-[72px] items-center gap-3.5 border-t border-line-soft px-[clamp(20px,4vw,28px)] py-3">
            <Skeleton className={`${block} h-[26px] w-[26px] shrink-0 rounded-[8px]`} />
            <Skeleton className={`${block} h-12 w-12 shrink-0 rounded-[10px]`} />
            <div className="min-w-0 flex-1">
              <Skeleton className={`${block} h-3.5 rounded-[7px]`} style={{ width }} />
              <Skeleton className={`${block} mt-2 h-2.5 w-[38%] rounded-[5px]`} />
            </div>
            <Skeleton className={`${block} h-6 w-11 shrink-0 rounded-[9px]`} />
          </div>
        ))}
      </Card>
    </div>
  );
}
