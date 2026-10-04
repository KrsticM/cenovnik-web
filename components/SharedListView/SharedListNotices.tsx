import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";

function QuietNotice({ children }: { children: ReactNode }) {
  return (
    <Alert
      role="status"
      className="mb-3.5 flex animate-[fadeIn_200ms_ease_both] items-start gap-2.5 rounded-[12px] border-bar-idle bg-sand px-3.5 py-3 text-sm leading-[1.45] text-ink"
    >
      <span aria-hidden="true" className="mt-1.5 block h-2 w-2 shrink-0 rounded-full border-[1.5px] border-ink-faint" />
      {children}
    </Alert>
  );
}

export function OfflineNotice() {
  return (
    <QuietNotice>
      Internet konekcija je izgubljena - prikazana je poslednja verzija liste. Osvežiće se kad se konekcija vrati.
    </QuietNotice>
  );
}

export function UnsavedNotice() {
  return <QuietNotice>Neke promene još nisu sačuvane. Pokušavamo ponovo, a ostali će ih videti čim uspe.</QuietNotice>;
}
