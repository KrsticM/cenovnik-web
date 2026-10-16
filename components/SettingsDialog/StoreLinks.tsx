import { Button } from "@/components/ui/button";
import { AppleIcon, GooglePlayIcon } from "@/components/ui/provider-icon";
import { QrCode } from "@/components/ui/qr-code";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/support";
import type { Platform } from "@/hooks/usePlatform";

const LINK = "rounded-xl font-medium text-white focus-visible:ring-offset-white";

// Each store is hidden on the other's phone, so nobody is sent to a store they cannot use.
interface StoreLinksProps {
  platform: Platform;
  // Only for people on a computer; null on a phone, which is already one tap from its store.
  qrUrl: string | null;
}

export function StoreLinks({ platform, qrUrl }: StoreLinksProps) {
  const buttons = (
    <div className="flex flex-[1_1_auto] flex-wrap gap-2.5">
      {platform !== "android" && (
        <Button asChild variant="dark" size="action" className={LINK}>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Preuzmi eCenovnik u App Store-u, otvara se u novoj kartici">
            <AppleIcon mono />
            <span>Preuzmi u App Store-u</span>
          </a>
        </Button>
      )}
      {platform !== "ios" && (
        <Button asChild variant="dark" size="action" className={LINK}>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Nabavi eCenovnik na Google Play-u, otvara se u novoj kartici">
            <GooglePlayIcon />
            <span>Nabavi na Google Play-u</span>
          </a>
        </Button>
      )}
    </div>
  );

  if (!qrUrl) return buttons;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {buttons}
      <figure className="flex items-center gap-3">
        <QrCode value={qrUrl} label="QR kod za preuzimanje eCenovnik aplikacije" />
        <figcaption className="max-w-[110px] text-[13px] leading-[1.4] text-ink-muted">Skeniraj telefonom i preuzmi aplikaciju</figcaption>
      </figure>
    </div>
  );
}
