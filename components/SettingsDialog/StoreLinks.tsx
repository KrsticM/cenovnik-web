import { Panel } from "@/components/ui/panel";
import { QrCode } from "@/components/ui/qr-code";
import { StoreBadge } from "@/components/ui/store-badge";
import type { Platform } from "@/hooks/usePlatform";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/support";

interface StoreLinksProps {
  platform: Platform;
  // Only for people on a computer; null on a phone, which is already one tap from its store.
  qrUrl: string | null;
}

// Each store is hidden on the other's phone, so nobody is sent to a store they cannot use.
function Badges({ platform }: { platform: Platform }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {platform !== "android" && <StoreBadge store="app_store" href={APP_STORE_URL} />}
      {platform !== "ios" && <StoreBadge store="google_play" href={PLAY_STORE_URL} />}
    </div>
  );
}

export function StoreLinks({ platform, qrUrl }: StoreLinksProps) {
  if (!qrUrl) return <Badges platform={platform} />;

  // A computer gets the QR code only; a window too narrow for the panel gets the badges instead.
  return (
    <>
      <Panel role="note" size="roomy" className="hidden items-center gap-5 sm:flex">
        <QrCode value={qrUrl} label="QR kod za preuzimanje aplikacije" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[15px] font-semibold">Preuzmi aplikaciju i aktiviraj Premium članstvo</span>
          <p className="text-sm leading-normal text-ink-muted text-pretty">
            Skeniraj kod kamerom svog telefona. Otvoriće se link do eCenovnik aplikacije u App Store-u ili Google Play-u.
          </p>
        </div>
      </Panel>
      <div className="sm:hidden">
        <Badges platform={platform} />
      </div>
    </>
  );
}
