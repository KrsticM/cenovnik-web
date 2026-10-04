import Link from "next/link";
import type { Store } from "@/lib/services/stores";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InitialsTile } from "@/components/ui/initials-tile";
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
          description="Prikazaćemo cene iz prodavnica u kojima kupuješ, pa ćeš lakše videti gde je najjeftinije."
          action={
            <Button asChild variant="sage" size="pill-md">
              <Link href="/prodavnice">Izaberi markete</Link>
            </Button>
          }
          className="mt-3.5"
        />
      );
    case "ready":
      return <OfferList groups={state.groups} unavailable={state.unavailable} />;
  }
}

function OfferList({ groups, unavailable }: { groups: OfferGroup[]; unavailable: Store[] }) {
  return (
    <>
      {groups.length > 0 ? (
        <div className="mt-3.5 flex flex-col gap-2.5">
          {groups.map((group, index) => (
            <StoreOfferRow key={group.key} group={group} best={index === 0} />
          ))}
        </div>
      ) : (
        <EmptyState
          variant="dashed"
          size="sm"
          illustration="not-in-markets"
          title="Proizvod nije dostupan u tvojim marketima."
          className="mt-3.5"
        />
      )}

      {unavailable.length > 0 && (
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-ink-muted">Nije dostupno u tvojim marketima</p>
          <div className="mt-2.5 flex flex-col gap-2">
            {unavailable.map((store) => (
              <Card key={store.id} className="flex items-center gap-3.5 rounded-[14px] border-0 bg-paper px-4 py-2.5 shadow-none">
                <InitialsTile name={store.retailerName} size="sm" tone="muted" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{store.retailerName}</p>
                  {store.address && <p className="mt-0.5 text-xs text-ink-muted">{store.address}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
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
