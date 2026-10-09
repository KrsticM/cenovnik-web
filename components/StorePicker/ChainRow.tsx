import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RetailerLogo } from "@/components/ui/retailer-logo";
import { retailerLogoUrl } from "@/lib/retailerLogos";
import { cn } from "@/lib/utils";
import type { ChainRow as ChainRowData } from "./storePickerModel";
import { StoreOption } from "./StoreOption";

interface ChainRowProps {
  chain: ChainRowData;
  first: boolean;
  onToggleChain: (chainId: string) => void;
  onToggleStore: (storeId: string) => void;
}

export function ChainRow({ chain, first, onToggleChain, onToggleStore }: ChainRowProps) {
  return (
    <Collapsible
      open={chain.open}
      onOpenChange={() => onToggleChain(chain.id)}
      className={cn(!first && "border-t border-line-soft")}
    >
      <div className="flex items-center gap-3.5 pl-3.5 pr-2">
        <RetailerLogo name={chain.name} src={retailerLogoUrl(chain.id)} />
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="group/trigger h-auto min-h-[68px] flex-1 justify-start gap-3 whitespace-normal rounded-[12px] py-0 pl-0 pr-1 text-left hover:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-base font-semibold text-ink">{chain.name}</span>
              <span className="text-[13px] font-normal text-ink-muted">{chain.subtitle}</span>
            </span>
            {chain.pickedCount > 0 && (
              <Badge variant="count" className="text-[13px]">
                {chain.pickedCount}
              </Badge>
            )}
            <span className="flex h-8 w-8 items-center justify-center text-ink-muted">
              <Chevron size="md" />
            </span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent asChild>
        <div role="group" aria-label={`${chain.name} marketi`} className="pb-2 pl-[68px] pr-3.5">
          {chain.stores.map((store) => (
            <StoreOption key={store.id} store={store} onToggle={onToggleStore} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
