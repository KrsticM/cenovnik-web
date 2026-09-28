"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  hasMore: boolean;
  isLoading: boolean;
  endLabel: string;
}

// Invisible scroll trigger below the grid; the loading placeholders live inside the grid itself.
export function InfiniteScrollSentinel({ onIntersect, hasMore, isLoading, endLabel }: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-observing after each load re-fires while the sentinel is still on screen,
  // so a tall viewport keeps pulling pages until it's filled.
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
    <div ref={ref} className="flex min-h-[72px] items-center justify-center">
      {!hasMore && <span className="text-[13px] text-ink-muted">{endLabel}</span>}
    </div>
  );
}
