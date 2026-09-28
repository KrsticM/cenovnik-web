import { useMediaQuery } from "@/hooks/useMediaQuery";

// Mirrors GRID_CLASSES: 2 columns on mobile, 3 from sm (640px), 4 from lg (1024px).
export function useGridColumns(): number {
  const sm = useMediaQuery("(min-width: 640px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  return lg ? 4 : sm ? 3 : 2;
}
