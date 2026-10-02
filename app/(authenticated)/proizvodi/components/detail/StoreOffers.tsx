import type { Store } from "@/lib/services/stores";
import { Card } from "@/components/ui/card";
import { InitialsTile } from "@/components/ui/initials-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { StateIllustration } from "@/components/ui/state-illustration";
import { cn } from "@/lib/utils";
import { initials, type OfferGroup } from "./groupOffers";
import { StoreOfferRow } from "./StoreOfferRow";

interface StoreOffersProps {
  loading: boolean;
  groups: OfferGroup[];
  unavailable: Store[];
}

const pulse = "animate-[pulse_1.4s_ease-in-out_infinite] bg-skeleton";

// Prices in the user's favourite stores, cheapest first, then favourites that don't carry it.
export function StoreOffers({ loading, groups, unavailable }: StoreOffersProps) {
  if (loading) {
    return (
      <div className="mt-3.5 flex flex-col gap-2.5" aria-busy="true" aria-label="Učitavanje cena">
        {[0, 1, 2].map((i) => (
          <Card key={i} aria-hidden="true" className="flex items-center gap-3.5 rounded-[14px] border-line px-4 py-3.5 shadow-none">
            <Skeleton className={cn(pulse, "h-11 w-11 shrink-0 rounded-[10px]")} />
            <span className="flex flex-1 flex-col gap-2">
              <Skeleton className={cn(pulse, "h-3.5 w-2/5 rounded-[7px]")} />
              <Skeleton className={cn(pulse, "h-[11px] w-[65%] rounded-[6px]")} />
            </span>
            <Skeleton className={cn(pulse, "h-[18px] w-[84px] shrink-0 rounded-[8px]")} />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {groups.length > 0 ? (
        <div className="mt-3.5 flex flex-col gap-2.5">
          {groups.map((group, index) => (
            <StoreOfferRow key={group.key} group={group} best={index === 0} />
          ))}
        </div>
      ) : (
        <Card className="mt-3.5 rounded-[14px] border-dashed border-toggle-off bg-transparent px-4 py-6 text-center shadow-none">
          <StateIllustration variant="not-in-markets" />
          <p className="mt-3 text-[15px] font-medium text-ink">Proizvod nije dostupan u tvojim marketima.</p>
        </Card>
      )}

      {unavailable.length > 0 && (
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-ink-muted">Nije dostupno u tvojim marketima</p>
          <div className="mt-2.5 flex flex-col gap-2">
            {unavailable.map((store) => (
              <Card key={store.id} className="flex items-center gap-3.5 rounded-[14px] border-0 bg-paper px-4 py-2.5 shadow-none">
                <InitialsTile size="sm" tone="muted">{initials(store.retailerName)}</InitialsTile>
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
