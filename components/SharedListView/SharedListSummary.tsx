import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionLabel } from "@/components/ui/section-label";
import type { ListSummaryLabels } from "./summarizeList";

export function SharedListSummary({ name, summary }: { name: string; summary: ListSummaryLabels }) {
  return (
    <div className="p-card">
      <SectionLabel className="tracking-[0.1em] text-rust">Podeljena lista</SectionLabel>
      <h1 id="list-title" className="mt-2 text-[clamp(26px,5vw,34px)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
        {name}
      </h1>

      <div className="mt-[22px] flex flex-wrap items-baseline justify-between gap-3">
        <span className="text-[15px] text-ink">{summary.summaryLabel}</span>
        {summary.remainingLabel && (
          <span className="text-[15px] font-semibold text-sage-dark">Ostalo {summary.remainingLabel}</span>
        )}
      </div>
      {summary.showProgress && (
        <>
          <ProgressBar value={summary.progress} className="mt-3" />
          <p className="mt-2 text-xs text-ink-muted">{summary.progressLabel}</p>
        </>
      )}
    </div>
  );
}
