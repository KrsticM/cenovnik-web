import type { ElementType } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@/components/ui/check-circle";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Heading as TitleText, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { SignedInLine, type SignedInLineProps } from "@/components/MyMarketsDialog/SignedInLine";
import { ChainRow } from "./ChainRow";
import { StoreLimitNotice } from "./StoreLimitNotice";
import { StoreSearch } from "./StoreSearch";
import type { StorePickerState } from "./useStorePicker";

interface StorePickerProps {
  picker: StorePickerState;
  onSave: () => void;
  // A dialog passes its title component, so the heading names the dialog.
  heading?: ElementType;
  // Only when the dialog cannot be closed: the way out for someone who signed in with the wrong account.
  signOut?: SignedInLineProps;
  // Takes the user to where Premium is explained; left out when the picker cannot be left.
  onUpgrade?: (trigger: HTMLElement) => void;
}

export function StorePicker({ picker, onSave, heading: Heading = "h1", signOut, onUpgrade }: StorePickerProps) {
  return (
    <div className="flex flex-col animate-[fadeUp_300ms_ease_150ms_both]">
      {picker.searchMode ? (
        <TitleText as={Heading} className="sr-only">
          Izaberi svoje markete
        </TitleText>
      ) : (
        <>
          {signOut && <SignedInLine {...signOut} />}
          {picker.isNewAccount && (
            <span className="flex items-center gap-2 text-[13px] font-medium text-sage-dark">
              <CheckCircle />
              Još samo ovaj korak
            </span>
          )}
          <TitleText as={Heading} className={cn(picker.isNewAccount && "mt-4")}>
            Izaberi svoje markete
          </TitleText>
          <Text className="mt-2.5">
            Cene proizvoda nisu iste u svim marketima. Izaberi markete koji te zanimaju kako bismo ti prikazali odgovarajuće cene.
          </Text>
        </>
      )}

      <StoreSearch
        value={picker.query}
        onChange={picker.setQuery}
        onStart={picker.startSearch}
        searchMode={picker.searchMode}
        onCancel={picker.exitSearch}
      />
      {picker.atLimit && <StoreLimitNotice text={picker.limitText} onUpgrade={picker.showUpsell ? onUpgrade : undefined} />}

      <div className="mt-3.5 max-h-[min(48vh,440px)] overflow-y-auto overscroll-contain rounded-[18px] border border-line">
        <ChainList picker={picker} />
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <Button
          variant="sage"
          size="cta"
          onClick={onSave}
          disabled={!picker.canSave}
          className="disabled:bg-sand-dark disabled:text-ink-warm disabled:opacity-100"
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
      <Text size="small" className="px-5 py-7 text-center">
        Nema marketa za „{picker.query}“. Probaj naziv ulice ili mesta.
      </Text>
    );
  }

  return picker.rows.map((chain, index) => (
    <ChainRow key={chain.id} chain={chain} first={index === 0} onToggleChain={picker.toggleChain} onToggleStore={picker.toggleStore} />
  ));
}
