import type { ReactNode } from "react";

export function StepHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h1 className="mt-6 text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink">{title}</h1>
      <p className="mt-2.5 text-base leading-normal text-ink-muted text-pretty">{children}</p>
    </>
  );
}
