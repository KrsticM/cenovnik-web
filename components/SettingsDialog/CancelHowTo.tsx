import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AppleIcon, GooglePlayIcon } from "@/components/ui/provider-icon";
import type { PremiumStore } from "@/lib/revenuecat";

interface CancelHowToProps {
  steps: { store: PremiumStore; text: string }[];
}

const STORE_NAMES = { app_store: "App Store", google_play: "Google Play" };

export function CancelHowTo({ steps }: CancelHowToProps) {
  return (
    <Collapsible className="flex flex-col gap-2.5">
      <CollapsibleTrigger asChild>
        <Button
          variant="underline"
          size="text"
          className="group/trigger -my-1 min-h-8 gap-1 self-start rounded text-sm underline-offset-[3px] focus-visible:ring-offset-0"
        >
          <span>Kako otkazati</span>
          <Chevron />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-2.5 pt-1 data-[state=open]:animate-[fadeIn_160ms_ease_both]">
        {steps.map(({ store, text }) => (
          <div key={store} className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-sage-dark">
              {store === "app_store" ? <AppleIcon mono /> : <GooglePlayIcon />}
              {STORE_NAMES[store]}
            </span>
            <p className="text-sm leading-normal text-pretty">{text}</p>
          </div>
        ))}
        <p className="text-[13px] leading-normal text-ink-muted text-pretty">
          Posle otkazivanja Premium ostaje aktivan do kraja plaćenog perioda.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
