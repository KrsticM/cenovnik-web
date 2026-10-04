import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionLabel } from "@/components/ui/section-label";

interface SharedListSummaryProps {
  name: string;
  summaryLabel: string;
  remainingLabel: string | null;
  progress: number;
  progressLabel: string;
  showProgress: boolean;
}

export function SharedListSummary({
  name,
  summaryLabel,
  remainingLabel,
  progress,
  progressLabel,
  showProgress,
}: SharedListSummaryProps) {
  return (
    <div className="p-[clamp(20px,4vw,28px)]">
      <SectionLabel className="tracking-[0.1em] text-rust">Podeljena lista</SectionLabel>
      <h1 id="list-title" className="mt-2 text-[clamp(26px,5vw,34px)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
        {name}
      </h1>

      <div className="mt-[22px] flex flex-wrap items-baseline justify-between gap-3">
        <span className="text-[15px] text-ink">{summaryLabel}</span>
        {remainingLabel && (
          <span className="text-[15px] font-semibold text-sage-dark">Ostalo {remainingLabel}</span>
        )}
      </div>
      {showProgress && (
        <>
          <ProgressBar value={progress} className="mt-3" />
          <p className="mt-2 text-xs text-ink-muted">{progressLabel}</p>
        </>
      )}
    </div>
  );
}
