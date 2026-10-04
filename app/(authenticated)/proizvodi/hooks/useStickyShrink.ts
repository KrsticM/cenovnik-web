import { useCallback, useState } from "react";

// "Stuck" once the scroll container moves past a few pixels: the detail header shrinks and casts a shadow.
export function useStickyShrink(threshold = 8) {
  const [stuck, setStuck] = useState(false);
  const onScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => setStuck(event.currentTarget.scrollTop > threshold),
    [threshold]
  );
  return { stuck, onScroll, reset: () => setStuck(false) };
}
