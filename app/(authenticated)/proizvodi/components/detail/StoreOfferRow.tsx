import { plural } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InitialsTile } from "@/components/ui/initials-tile";
import { Price } from "@/components/ui/price";
import { initials, type OfferGroup } from "./groupOffers";

interface StoreOfferRowProps {
  group: OfferGroup;
  best: boolean;
}

export function StoreOfferRow({ group, best }: StoreOfferRowProps) {
  const single = group.stores.length === 1;
  const count = group.stores.length;

  return (
    <Collapsible asChild>
      <Card
        className={cn(
          "rounded-[14px] bg-white px-4 py-3.5 shadow-none",
          best ? "border-sage" : "border-line"
        )}
      >
        <div className="flex items-center gap-3.5">
          <InitialsTile>{initials(group.retailerName)}</InitialsTile>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">{group.retailerName}</span>
              {best && <Badge variant="tag">Najniža cena</Badge>}
            </div>
            {single ? (
              group.stores[0].address && (
                <p className="mt-[3px] text-[13px] text-ink-muted">{group.stores[0].address}</p>
              )
            ) : (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="group/trigger mt-0.5 h-auto gap-2 p-0 py-[3px] text-[13px] font-normal text-ink-muted hover:bg-transparent hover:text-sage-dark"
                >
                  {count} {plural(count, "lokacija", "lokacije", "lokacija")}
                  <Chevron />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-[3px]">
            {group.regularPrice !== null ? (
              <span className="flex items-center gap-1.5">
                <Price value={group.regularPrice} tone="muted" className="text-xs" />
                <Badge variant="discount">−{group.maxDiscountPct}%</Badge>
              </span>
            ) : (
              group.isDeal && <Badge variant="discount">do −{group.maxDiscountPct}%</Badge>
            )}
            <Price value={group.price} size="compare" className="text-[17px] tracking-normal" />
          </div>
        </div>
        {!single && (
          <CollapsibleContent asChild>
            <ul className="ml-[58px] mt-2.5 flex flex-col gap-1.5 data-[state=open]:animate-[dropIn_150ms_ease_both]">
              {group.stores.map((store) => (
                <li key={store.id} className="text-[13px] text-ink">
                  {store.address ?? group.retailerName}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  );
}
