import { BrandBars } from "@/components/ui/brand-bars";
import type { CatalogItem } from "@/lib/services/products";
import { GRID_CLASSES } from "@/lib/gridClasses";
import { ShowcaseCard } from "./ShowcaseCard";

// A still picture of /proizvodi: inert, hidden from assistive tech, under a blurred scrim.
export function SigninBackdrop({ items }: { items: CatalogItem[] }) {
  return (
    <>
      <div aria-hidden="true" inert className="pointer-events-none fixed inset-0 overflow-hidden bg-paper">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex h-[68px] max-w-[1360px] items-center gap-2.5 px-4 sm:px-5 lg:px-8 2xl:max-w-[1720px] 2xl:px-12">
            <BrandBars size="md" />
            <span className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.025em] text-ink">
              <span className="text-terracotta">e</span>Cenovnik
            </span>
          </div>
        </header>
        <section className="border-b border-cream-band-border bg-cream">
          <div className="mx-auto flex max-w-[1360px] justify-center px-4 pb-[26px] pt-7 sm:px-5 lg:px-8 lg:pb-10 lg:pt-10 2xl:max-w-[1720px]">
            <div className="h-[52px] w-full max-w-[720px] rounded-full border border-cream-border bg-white lg:h-[62px]" />
          </div>
        </section>
        <div className="mx-auto w-full max-w-[1360px] px-4 pt-7 sm:px-5 lg:px-8 lg:pt-10 2xl:max-w-[1720px] 2xl:px-12">
          <p className="mb-6 text-[26px] font-semibold tracking-[-0.03em] text-ink lg:text-[34px]">Popularni proizvodi</p>
          <div className={GRID_CLASSES}>
            {items.map((item) => (
              <ShowcaseCard key={item.product.id} item={item} />
            ))}
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[linear-gradient(180deg,rgba(26,26,26,0.18)_0%,rgba(26,26,26,0.42)_100%)] backdrop-blur-[1.5px]"
      />
    </>
  );
}
