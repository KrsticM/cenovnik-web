import { Input } from "@/components/ui/input";

interface StoreSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function StoreSearch({ value, onChange }: StoreSearchProps) {
  return (
    <div className="relative mt-6 flex items-center">
      <span aria-hidden="true" className="pointer-events-none absolute left-[18px] block h-3.5 w-3.5 rounded-full border-2 border-ink-stone" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Pretraži markete po nazivu, adresi ili mestu"
        placeholder="Pretraži po nazivu, adresi ili mestu"
        className="h-12 rounded-full border-line bg-white pl-11 pr-[18px] text-base text-ink focus-visible:border-sage focus-visible:ring-[3px] focus-visible:ring-sage/18 focus-visible:ring-offset-0 md:text-base"
      />
    </div>
  );
}
