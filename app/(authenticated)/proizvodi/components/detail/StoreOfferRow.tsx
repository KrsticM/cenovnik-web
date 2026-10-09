import { plural } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DealPrice } from "@/components/ui/deal-price";
import { RetailerLogo } from "@/components/ui/retailer-logo";
import { retailerLogoUrl } from "@/lib/retailerLogos";
import { StoreCard } from "@/components/StoreCard/StoreCard";
import type { OfferGroup } from "./groupOffers";

interface StoreOfferRowProps {
  group: OfferGroup;
  best: boolean;
}

export function StoreOfferRow({ group, best }: StoreOfferRowProps) {
  const count = group.stores.length;
  const single = count === 1;

  const subtitle = single ? (
    group.stores[0].address && <p className="mt-[3px] text-[13px] text-ink-muted">{group.stores[0].address}</p>
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
  );

  return (
    <Collapsible asChild>
      <StoreCard
        retailerName={group.retailerName}
        highlight={best}
        align="center"
        className="px-4 py-3.5"
        leading={<RetailerLogo name={group.retailerName} src={retailerLogoUrl(group.retailerId)} className="h-11 w-11" />}
        badge={best && <Badge variant="tag">Najniža cena</Badge>}
        subtitle={subtitle}
        aside={
          <DealPrice
            layout="stacked"
            price={group.price}
            regularPrice={group.regularPrice}
            discountPct={group.isDeal ? group.maxDiscountPct : undefined}
            upTo={group.regularPrice === null}
            size="compare"
            priceClassName="text-[17px] tracking-normal"
          />
        }
      >
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
      </StoreCard>
    </Collapsible>
  );
}
