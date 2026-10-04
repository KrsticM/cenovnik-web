import { Skeleton } from "@/components/ui/skeleton";

export function ListPanelSkeleton() {
  return (
    <div className="min-h-0 flex-1 px-5 py-2" aria-busy="true" aria-label="Učitavanje liste">
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="grid grid-cols-[56px_1fr_auto] items-start gap-3.5 border-b border-line-soft py-4">
          <Skeleton className="h-14 rounded-[10px]" />
          <div className="flex flex-col gap-2 pt-1">
            <Skeleton className="h-3.5 w-4/5 rounded-[7px]" />
            <Skeleton className="h-[11px] w-[45%] rounded-[6px]" />
            <Skeleton className="mt-1 h-[34px] w-24 rounded-[17px]" />
          </div>
          <Skeleton className="h-4 w-[72px] rounded-[8px]" />
        </div>
      ))}
    </div>
  );
}
