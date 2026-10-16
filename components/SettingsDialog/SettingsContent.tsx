import { Button } from "@/components/ui/button";
import type { Platform } from "@/hooks/usePlatform";
import type { SubscriptionState } from "@/hooks/useSubscription";
import type { SubscriptionCopy } from "@/lib/subscription";
import { PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from "@/lib/support";
import { AccountInfo } from "./AccountInfo";
import { LegalLinks } from "./LegalLinks";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";
import { SubscriptionStatus } from "./SubscriptionStatus";
import type { AccountKind } from "./settings";

const LEGAL = [
  { label: "Uslovi korišćenja", href: TERMS_URL },
  { label: "Politika privatnosti", href: PRIVACY_URL },
];

export interface SettingsContentProps {
  subscription: SubscriptionState;
  subscriptionCopy: SubscriptionCopy;
  platform: Platform;
  qrUrl: string | null;
  account: { account: string; kind: AccountKind; line: string };
  focusDelete: boolean;
  focusSubscription: boolean;
  onRetry: () => void;
  onDelete: () => void;
}

export function SettingsContent({
  subscription,
  subscriptionCopy,
  platform,
  qrUrl,
  account,
  focusDelete,
  focusSubscription,
  onRetry,
  onDelete,
}: SettingsContentProps) {
  return (
    <>
      <SettingsHeader />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-7">
        <SettingsSection title="Pretplata" first focusTitle={focusSubscription}>
          <SubscriptionStatus state={subscription} copy={subscriptionCopy} platform={platform} qrUrl={qrUrl} onRetry={onRetry} />
        </SettingsSection>

        <SettingsSection title="Nalog">
          <AccountInfo account={account.account} kind={account.kind} providerLine={account.line} />
        </SettingsSection>

        <SettingsSection title="Pomoć">
          <SettingsRow
            label="Kontakt i podrška"
            action={
              <Button asChild variant="underline" size="link" className="font-medium">
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection title="Brisanje naloga">
          <SettingsRow
            description="Trajno briše nalog, izabrane markete i liste za kupovinu."
            action={
              <Button
                autoFocus={focusDelete}
                type="button"
                variant="danger-outline"
                size="action"
                onClick={onDelete}
              >
                Obriši nalog
              </Button>
            }
          />
        </SettingsSection>
        <LegalLinks links={LEGAL} placement="inline" />
      </div>
      <LegalLinks links={LEGAL} placement="pinned" />
    </>
  );
}
