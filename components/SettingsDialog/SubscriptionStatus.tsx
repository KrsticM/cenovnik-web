import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Platform } from "@/hooks/usePlatform";
import type { SubscriptionState } from "@/hooks/useSubscription";
import type { SubscriptionCopy } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import { CancelHowTo } from "./CancelHowTo";
import { StoreLinks } from "./StoreLinks";

interface SubscriptionStatusProps {
  state: SubscriptionState;
  platform: Platform;
  qrUrl: string | null;
  copy: SubscriptionCopy;
  onRetry: () => void;
}

const TONES = { premium: "premium", standard: "standard", loading: "neutral", unknown: "neutral" } as const;

const NOTE = "text-sm leading-normal text-pretty";

export function SubscriptionStatus({ state, platform, qrUrl, copy, onRetry }: SubscriptionStatusProps) {
  return (
    <Panel role="status" aria-busy={state.status === "loading"} tone={TONES[state.status]} size="card" className="flex-col gap-3.5">
      {state.status === "loading" && (
        <div role="img" aria-label="Učitavanje pretplate" className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-[120px] rounded-[12px] bg-line-warm" />
          <Skeleton className="h-3.5 w-[200px] max-w-full rounded-[7px] bg-sand" />
          <Skeleton className="mt-1 h-12 w-full rounded-[12px] bg-sand" />
        </div>
      )}

      {state.status === "unknown" && (
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
            <span className="text-[15px] font-semibold">Status trenutno nije dostupan</span>
            <p className={cn(NOTE, "text-ink-muted")}>Ne možemo da proverimo pretplatu. Pokušaj ponovo za trenutak.</p>
          </div>
          <Button type="button" variant="pill" size="action" onClick={onRetry}>
            <RefreshCw strokeWidth={2} className="!size-[15px]" />
            Pokušaj ponovo
          </Button>
        </div>
      )}

      {state.status === "standard" && (
        <>
          <span className="text-base font-semibold">Standardno članstvo</span>
          <p className={cn(NOTE, "-mt-1.5 text-ink-muted")}>
            Želiš da isprobaš benefite Premium članstva i pratiš cene u neograničenom broju omiljenih marketa umesto dosadašnjih 10?
            Premium članstvo možeš aktivirati putem mobilne eCenovnik aplikacije.
          </p>
          <StoreLinks platform={platform} qrUrl={qrUrl} />
        </>
      )}

      {state.status === "premium" && <PremiumDetails copy={copy} />}
    </Panel>
  );
}

function PremiumDetails({ copy }: { copy: SubscriptionCopy }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <span className="text-base font-semibold">Premium članstvo</span>
        {copy.badge === "cancelled" && <Badge variant="notice">Otkazano</Badge>}
        {copy.badge === "trial" && <Badge variant="trial">Probni period</Badge>}
        {copy.badge === "lastDay" && <Badge variant="notice">Poslednji dan</Badge>}
      </div>
      {copy.dateLine && <span className="-mt-1.5 text-sm text-ink-muted">{copy.dateLine}</span>}
      {copy.trialProgress !== null && <ProgressBar tone="trial" value={copy.trialProgress} className="-mt-1" />}
      <Panel role="note" className="flex-col gap-2.5">
        <p className={NOTE}>{copy.manageNote}</p>
        {copy.showHow && <CancelHowTo steps={copy.howSteps} footnote={copy.howFoot} defaultOpen={copy.howOpenByDefault} />}
      </Panel>
    </>
  );
}
