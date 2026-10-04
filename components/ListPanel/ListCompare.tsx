"use client";

import { formatPrice, plural } from "@/lib/formatPrice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Price } from "@/components/ui/price";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ListComparison, StoreComparisonRow } from "./useListComparison";

interface ListCompareProps {
  comparison: ListComparison;
  loading: boolean;
  itemCount: number;
  listTotal: number;
}

const articles = (n: number) => plural(n, "artikal", "artikla", "artikala");

export function ListCompare({ comparison, loading, itemCount, listTotal }: ListCompareProps) {
  const { rows, cheapestComplete, usedStoreCount, unavailableCount } = comparison;

  if (loading && rows.length === 0) {
    return (
      <div className="flex flex-col gap-3 pb-4 pt-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[118px] animate-[pulse_1.4s_ease-in-out_infinite] rounded-[14px] bg-skeleton" />
        ))}
      </div>
    );
  }

  const deltaLabel = (row: StoreComparisonRow) => {
    if (row.missing.length > 0) {
      return `za ${row.available.length} od ${itemCount} ${plural(itemCount, "artikla", "artikla", "artikala")}`;
    }
    if (row === cheapestComplete) return "najniža cena za celu listu";
    return `+${formatPrice(row.total - (cheapestComplete?.total ?? 0))}`;
  };

  const combinedNote = [
    "Svaki artikal iz marketa gde je najjeftiniji",
    `${usedStoreCount} ${plural(usedStoreCount, "market", "marketa", "marketa")}`,
    unavailableCount > 0
      ? `${unavailableCount} ${plural(unavailableCount, "artikal nije dostupan", "artikla nisu dostupna", "artikala nije dostupno")}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-3 pb-4 pt-3">
      {rows.map((row, index) => {
        const complete = row.missing.length === 0;
        return (
          <Card
            key={row.store.id}
            className={cn(
              "rounded-[14px] bg-white p-4 shadow-none",
              index === 0 ? "border-sage" : "border-line"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {index === 0 && (
                  <Badge variant="best" className="mb-2">
                    {complete ? "Najpovoljnije" : "Najviše artikala"}
                  </Badge>
                )}
                <div className="text-[15px] font-semibold text-ink">{row.store.retailerName}</div>
                {row.store.address && (
                  <div className="mt-[3px] text-xs text-ink-muted">{row.store.address}</div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <Price value={row.total} size="compare" tone="ink" className="block" />
                <div className="mt-[3px] whitespace-nowrap text-xs text-ink-muted">{deltaLabel(row)}</div>
              </div>
            </div>

            <Separator className="my-3 bg-line-soft" />
            <div>
              {complete ? (
                <span className="text-[13px] font-medium text-sage-dark">Svi artikli dostupni</span>
              ) : (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="group/trigger h-auto p-0 py-1 text-[13px] text-rust hover:bg-transparent hover:text-rust"
                    >
                      Nedostaje {row.missing.length} {articles(row.missing.length)}
                      <Chevron />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <ul className="mt-1.5 flex flex-col gap-1 data-[state=open]:animate-[dropIn_150ms_ease_both]">
                      {row.missing.map((item) => (
                        <li key={item.id} className="flex items-baseline gap-2 text-[13px] leading-[1.4] text-ink">
                          <span aria-hidden="true" className="block h-[5px] w-[5px] shrink-0 -translate-y-0.5 rounded-full bg-rust" />
                          {item.productName}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </Card>
        );
      })}

      <Card className="flex items-start justify-between gap-3 rounded-[14px] border-dashed border-toggle-off bg-transparent p-4 shadow-none">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink">Kombinovano</div>
          <div className="mt-[3px] text-xs leading-[1.45] text-ink-muted">{combinedNote}</div>
        </div>
        <Price value={listTotal} size="compare" tone="ink" />
      </Card>
    </div>
  );
}
