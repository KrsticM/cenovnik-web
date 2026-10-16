import { ProviderTile } from "@/components/ui/provider-icon";
import type { AccountKind } from "./settings";

interface AccountInfoProps {
  account: string;
  kind: AccountKind;
  providerLine: string;
}

export function AccountInfo({ account, kind, providerLine }: AccountInfoProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProviderTile kind={kind} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-medium wrap-anywhere">{account}</span>
        <span className="text-[13px] text-ink-muted">{providerLine}</span>
      </div>
    </div>
  );
}
