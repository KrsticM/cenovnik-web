import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  searchFound?: number | null;
  isSearchMode: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  searchFound,
  isSearchMode,
}: SearchBarProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="search" className="text-sm font-medium text-foreground">
        Pretraži proizvode
      </label>
      <div className="relative">
        <Input
          id="search"
          type="text"
          placeholder="Unesite naziv ili barcode..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pr-10"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Očisti pretragu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isSearchMode && searchFound !== null && (
        <div className="text-sm text-muted-foreground">
          Pronađeno {searchFound}{" "}
          {searchFound === 1
            ? "proizvod"
            : (searchFound as number) < 5
              ? "proizvoda"
              : "proizvoda"}
        </div>
      )}
    </div>
  );
}
