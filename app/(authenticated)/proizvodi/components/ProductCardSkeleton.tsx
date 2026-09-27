import { cn } from "@/lib/utils";

const bar = "block animate-[pulse_1.4s_ease-in-out_infinite] rounded-[6px] bg-skeleton";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("overflow-hidden rounded-2xl border border-line bg-white", className)}>
      <span className="block aspect-square max-h-[340px] w-full animate-[pulse_1.4s_ease-in-out_infinite] bg-skeleton" />
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3.5">
        <span className={cn(bar, "h-3 w-[90%]")} />
        <span className={cn(bar, "h-3 w-[60%]")} />
        <span className={cn(bar, "mt-2 h-[18px] w-[42%]")} />
      </div>
    </div>
  );
}
