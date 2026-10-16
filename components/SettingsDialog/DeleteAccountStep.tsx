import { CircleAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export interface DeleteAccountStepProps {
  // Set only while Premium is active: deleting the account does not cancel the store subscription.
  subscriptionNote: string | null;
  confirmed: boolean;
  pending: boolean;
  failed: boolean;
  onConfirmedChange: (confirmed: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const BUTTON = "h-12 rounded-full px-[22px] text-[15px] focus-visible:ring-offset-white";

export function DeleteAccountStep({
  subscriptionNote,
  confirmed,
  pending,
  failed,
  onConfirmedChange,
  onConfirm,
  onCancel,
}: DeleteAccountStepProps) {
  return (
    <div className="flex min-h-0 flex-1 animate-[stepIn_200ms_ease_both] flex-col gap-4 overflow-y-auto px-5 py-6 sm:p-7">
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-[22px] font-semibold tracking-[-0.02em]">Zaista želiš da obrišeš nalog?</DialogTitle>
        <p className="text-[15px] leading-normal text-ink-muted text-pretty">
          Obrisaćeš nalog, izabrane markete i liste za kupovinu. Ova akcija se ne može poništiti.
        </p>
      </div>

      {subscriptionNote && (
        <Alert role="note" className="flex gap-2.5 rounded-xl border-rust-border bg-rust-tint px-3.5 py-3">
          <CircleAlert className="mt-px size-[18px] shrink-0 text-rust" strokeWidth={2} aria-hidden="true" />
          <p className="text-sm leading-normal text-pretty">{subscriptionNote}</p>
        </Alert>
      )}

      <Label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line px-3.5 py-[13px] text-sm font-normal leading-[1.45]">
        <Checkbox
          checked={confirmed}
          disabled={pending}
          onCheckedChange={(next) => onConfirmedChange(next === true)}
          className="size-5 rounded-[5px] border-[1.5px] border-line data-[state=checked]:border-rust data-[state=checked]:bg-rust data-[state=checked]:text-white focus-visible:ring-sage"
        />
        <span>Razumem da se moji podaci trajno brišu.</span>
      </Label>

      {failed && (
        <Alert className="rounded-xl border-rust-border bg-rust-tint px-3.5 py-3 text-sm leading-normal text-rust text-pretty">
          Brisanje nije uspelo. Pokušaj ponovo ili nam piši na podršku.
        </Alert>
      )}

      <div className="mt-2 flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
        <Button autoFocus type="button" variant="pill" className={BUTTON} disabled={pending} onClick={onCancel}>
          Odustani
        </Button>
        <Button type="button" variant="danger" className={BUTTON} disabled={!confirmed || pending} onClick={onConfirm}>
          {pending && <Spinner tone="cream" />}
          {pending ? "Brišem nalog…" : "Obriši nalog"}
        </Button>
      </div>
    </div>
  );
}
