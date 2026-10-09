import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductOffersState } from "../../hooks/useProductDetail";
import type { OfferGroup } from "./groupOffers";
import { StoreOfferRow } from "./StoreOfferRow";

export function StoreOffers({ state }: { state: ProductOffersState }) {
  switch (state.status) {
    case "loading":
      return <StoreOffersSkeleton />;
    case "error":
      return <OffersAlert>{state.message}</OffersAlert>;
    case "stores-failed":
      return <OffersAlert>Tvoji marketi trenutno nisu dostupni. Pokušaj ponovo za koji trenutak.</OffersAlert>;
    case "no-stores":
      return (
        <EmptyState
          variant="dashed"
          size="sm"
          illustration="no-markets"
          title="Izaberi svoje markete"
          description="Prikazaćemo cene iz marketa u kojima kupuješ, pa ćeš lakše videti gde je najjeftinije."
          action={
            <Button asChild variant="sage" size="pill-md">
              <Link href="/moji-marketi">Izaberi markete</Link>
            </Button>
          }
          className="mt-3.5"
        />
      );
    case "ready":
      return <OfferList groups={state.groups} />;
  }
}

function OfferList({ groups }: { groups: OfferGroup[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        size="sm"
        illustration="not-in-markets"
        title="Proizvod nije dostupan u tvojim marketima."
        description="Možda ga ima u nekom drugom marketu."
        action={
          <Button asChild variant="pill" className="h-10 rounded-full px-[18px]">
            <Link href="/moji-marketi">Dodaj market</Link>
          </Button>
        }
        className="mt-3.5"
      />
    );
  }

  return (
    <div className="mt-3.5 flex flex-col gap-2.5">
      {groups.map((group, index) => (
        <StoreOfferRow key={group.key} group={group} best={index === 0} />
      ))}
    </div>
  );
}

function OffersAlert({ children }: { children: React.ReactNode }) {
  return (
    <Alert variant="destructive" className="mt-3.5 border-0 bg-destructive/10">
      {children}
    </Alert>
  );
}

function StoreOffersSkeleton() {
  return (
    <div className="mt-3.5 flex flex-col gap-2.5" aria-busy="true" aria-label="Učitavanje cena">
      {[0, 1, 2].map((i) => (
        <Card key={i} aria-hidden="true" className="flex items-center gap-3.5 rounded-[14px] border-line px-4 py-3.5 shadow-none">
          <Skeleton className="h-11 w-11 shrink-0 rounded-[10px]" />
          <span className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-2/5 rounded-[7px]" />
            <Skeleton className="h-[11px] w-[65%] rounded-[6px]" />
          </span>
          <Skeleton className="h-[18px] w-[84px] shrink-0 rounded-[8px]" />
        </Card>
      ))}
    </div>
  );
}
