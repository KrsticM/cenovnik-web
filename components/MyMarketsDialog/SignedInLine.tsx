import { Button } from "@/components/ui/button";

interface SignedInLineProps {
  account: string;
  via: string | null;
  onSignOut: () => void;
}

export function SignedInLine({ account, via, onSignOut }: SignedInLineProps) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line-warm pb-3">
      <span className="min-w-0 flex-auto text-[13px] leading-[1.45] text-ink-muted wrap-anywhere">
        Prijavljen kao <strong className="font-medium text-ink">{account}</strong>
        {via && <span className="whitespace-nowrap"> · {via}</span>}
      </span>
      <Button type="button" variant="underline" size="text" onClick={onSignOut} className="shrink-0 text-[13px] font-normal">
        Odjavi se
      </Button>
    </div>
  );
}
