"use client";

import { useEffect, useRef } from "react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { GRID_CLASSES } from "../config";

interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  hasMore: boolean;
  isLoading: boolean;
  endLabel: string;
}

export function InfiniteScrollSentinel({
  onIntersect,
  hasMore,
  isLoading,
  endLabel,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-observing after each load re-fires while the sentinel is still on screen,
  // so filtered-out pages keep pulling until something visible arrives.
  useEffect(() => {
    if (!hasMore || isLoading || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: "300px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onIntersect, hasMore, isLoading]);

  return (
    <div ref={ref} className="mt-3 flex min-h-[72px] flex-col items-center justify-center sm:mt-5">
      {hasMore ? (
        <div aria-busy="true" aria-label="Učitavanje još proizvoda" className={`${GRID_CLASSES} w-full`}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton className="hidden sm:block" />
          <ProductCardSkeleton className="hidden lg:block" />
        </div>
      ) : (
        <span className="text-[13px] text-ink-muted">{endLabel}</span>
      )}
    </div>
  );
}
