import { RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const TONES = {
  premium: "border-gold-border bg-gold-wash",
  standard: "border-sage-wash-line bg-sage-wash",
  neutral: "border-line-warm bg-ivory",
};

const tone = (status: SubscriptionState["status"]) =>
  status === "premium" ? TONES.premium : status === "standard" ? TONES.standard : TONES.neutral;

const NOTE = "text-sm leading-normal text-pretty";

export function SubscriptionStatus({ state, platform, qrUrl, copy, onRetry }: SubscriptionStatusProps) {
  return (
    <Alert
      role="status"
      aria-live="polite"
      aria-busy={state.status === "loading"}
      className={cn("flex flex-col gap-3.5 rounded-2xl px-5 py-[18px]", tone(state.status))}
    >
      {state.status === "loading" && (
        <div role="img" aria-label="Učitavanje pretplate" className="flex flex-col gap-2.5">
          <Skeleton className="h-6 w-[120px] rounded-xl bg-line-warm" />
          <Skeleton className="h-3.5 w-[200px] max-w-full rounded-[7px] bg-sand" />
          <Skeleton className="mt-1 h-12 w-full rounded-xl bg-sand" />
        </div>
      )}

      {state.status === "unknown" && (
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
            <span className="text-[15px] font-semibold">Status trenutno nije dostupan</span>
            <p className={cn(NOTE, "text-ink-muted")}>Ne možemo da proverimo pretplatu. Pokušaj ponovo za trenutak.</p>
          </div>
          <Button type="button" variant="pill" size="action" className="focus-visible:ring-offset-0" onClick={onRetry}>
            <RefreshCw strokeWidth={2} className="!size-[15px]" />
            Pokušaj ponovo
          </Button>
        </div>
      )}

      {state.status === "standard" && (
        <>
          <span className="text-base font-semibold">Standard članstvo</span>
          <p className={cn(NOTE, "-mt-1.5 text-ink-muted")}>
            Sa Premiumom pratiš cene u do 25 marketa umesto 10. Premium možeš aktivirati u mobilnoj aplikaciji.
          </p>
          <StoreLinks platform={platform} qrUrl={qrUrl} />
        </>
      )}

      {state.status === "premium" && <PremiumDetails copy={copy} />}
    </Alert>
  );
}

function PremiumDetails({ copy }: { copy: SubscriptionCopy }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <span className="text-base font-semibold">Premium članstvo</span>
        {copy.cancelled && <Badge variant="cancelled">Otkazano</Badge>}
      </div>
      {copy.dateLine && <span className="-mt-1.5 text-sm text-ink-muted">{copy.dateLine}</span>}
      <Alert role="note" className="flex flex-col gap-2.5 rounded-xl border-0 bg-white/70 px-3.5 py-3">
        <p className={NOTE}>{copy.manageNote}</p>
        {copy.showHow && <CancelHowTo steps={copy.howSteps} />}
      </Alert>
    </>
  );
}
