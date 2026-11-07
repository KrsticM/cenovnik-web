import { AdSenseAd } from "@/components/AdSense/AdSenseAd";
import { Button } from "@/components/ui/button";
import { AD_SLOTS, type AdSize } from "@/lib/ads";

interface GridAdRowProps {
  size: AdSize;
  onPremium?: (trigger: HTMLElement) => void;
}

export function GridAdRow({ size, onPremium }: GridAdRowProps) {
  return (
    <div className="col-span-full my-2 flex flex-col items-center gap-6 has-[[data-ad-status=unfilled]]:hidden">
      <AdSenseAd slot={AD_SLOTS.grid} size={size} />
      {onPremium && (
        <p className="m-0 text-center text-[13px] leading-normal text-pretty text-ink-muted">
          Uporedi cene bez reklama uz Premium članstvo, od 1,99 € mesečno.{" "}
          <Button
            variant="underline"
            size="text"
            onClick={(event) => onPremium(event.currentTarget)}
            className="inline font-medium hover:text-sage-darker"
          >
            Probaj 14 dana besplatno
          </Button>
        </p>
      )}
    </div>
  );
}
