import type { ElementType } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@/components/ui/check-circle";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChainRow } from "./ChainRow";
import { PickedStoreChips } from "./PickedStoreChips";
import { StoreLimitNotice } from "./StoreLimitNotice";
import { StoreSearch } from "./StoreSearch";
import type { StorePickerState } from "./useStorePicker";

interface StorePickerProps {
  picker: StorePickerState;
  onSave: () => void;
  // A dialog passes its title component, so the heading names the dialog.
  heading?: ElementType;
}

export function StorePicker({ picker, onSave, heading: Heading = "h1" }: StorePickerProps) {
  return (
    <div className="flex flex-col animate-[fadeUp_300ms_ease_150ms_both]">
      {picker.isNewAccount && (
        <span className="flex items-center gap-2 text-[13px] font-medium text-sage-dark">
          <CheckCircle />
          Još samo ovaj korak
        </span>
      )}
      <Heading className={cn("text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink", picker.isNewAccount && "mt-4")}>
        Izaberi svoje markete
      </Heading>
      <p className="mt-2.5 text-base leading-normal text-ink-muted text-pretty">
        Cene proizvoda nisu iste u svim marketima. Izaberi markete koji te zanimaju kako bismo ti prikazali odgovarajuće cene.
      </p>

      <StoreSearch value={picker.query} onChange={picker.setQuery} />
      <PickedStoreChips chips={picker.chips} onRemove={picker.toggleStore} />
      {picker.atLimit && <StoreLimitNotice text={picker.limitText} showUpsell={picker.showUpsell} />}

      <div className="mt-3.5 max-h-[min(48vh,440px)] overflow-y-auto overscroll-contain rounded-[18px] border border-line">
        <ChainList picker={picker} />
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <Button
          variant="sage"
          onClick={onSave}
          disabled={!picker.canSave}
          className="h-[52px] rounded-full text-[15px] font-medium focus-visible:ring-offset-[3px] disabled:bg-sand-dark disabled:text-ink-warm disabled:opacity-100"
        >
          {picker.saving && <Spinner tone="cream" />}
          {picker.saveLabel}
        </Button>
        <span aria-live="polite" className={cn("text-center text-[13px]", picker.saveFailed ? "text-rust" : "text-ink-muted")}>
          {picker.saveHint}
        </span>
      </div>
    </div>
  );
}

function ChainList({ picker }: { picker: StorePickerState }) {
  if (picker.loadState === "loading") {
    return (
      <div role="status" aria-busy="true" aria-label="Učitavanje marketa">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("flex min-h-[68px] items-center gap-3.5 px-3.5", i > 0 && "border-t border-line-soft")}>
            <Skeleton className="h-10 w-10 rounded-[10px]" />
            <span className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-1/3 rounded-[7px]" />
              <Skeleton className="h-2.5 w-1/4 rounded-[5px]" />
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (picker.loadState === "error") {
    return (
      <EmptyState
        size="sm"
        className="px-5 py-7"
        title="Marketi trenutno nisu dostupni."
        action={
          <Button variant="pill" size="pill-sm" onClick={picker.retry}>
            Pokušaj ponovo
          </Button>
        }
      />
    );
  }

  if (picker.rows.length === 0) {
    return (
      <p className="px-5 py-7 text-center text-sm leading-normal text-ink-muted text-pretty">
        Nema marketa za „{picker.query}“. Probaj naziv ulice ili mesta.
      </p>
    );
  }

  return picker.rows.map((chain, index) => (
    <ChainRow key={chain.id} chain={chain} first={index === 0} onToggleChain={picker.toggleChain} onToggleStore={picker.toggleStore} />
  ));
}
