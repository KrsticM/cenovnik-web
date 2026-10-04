import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_WIDTHS = ["70%", "55%", "78%", "48%"];

export function SharedListSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Učitavanje liste…</span>
      <Card aria-hidden="true" className="overflow-hidden rounded-[18px] border-line bg-white shadow-none">
        <div className="p-card">
          <Skeleton className="h-3 w-[110px] rounded-[6px]" />
          <Skeleton className="mt-3.5 h-[30px] w-[62%] rounded-[8px]" />
          <Skeleton className="mt-3 h-3.5 w-[120px] rounded-[7px]" />
          <Skeleton className="mt-6 h-4 w-[48%] rounded-[8px]" />
          <Skeleton className="mt-3.5 h-1.5 w-full rounded-[3px]" />
        </div>
        {ROW_WIDTHS.map((width) => (
          <div key={width} className="flex min-h-[72px] items-center gap-3.5 border-t border-line-soft px-card py-3">
            <Skeleton className="h-[26px] w-[26px] shrink-0 rounded-[8px]" />
            <Skeleton className="h-12 w-12 shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3.5 rounded-[7px]" style={{ width }} />
              <Skeleton className="mt-2 h-2.5 w-[38%] rounded-[5px]" />
            </div>
            <Skeleton className="h-6 w-11 shrink-0 rounded-[9px]" />
          </div>
        ))}
      </Card>
    </div>
  );
}
