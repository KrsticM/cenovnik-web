import { useCallback, useState } from "react";

export function useStickyShrink(threshold = 8) {
  const [stuck, setStuck] = useState(false);
  const onScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => setStuck(event.currentTarget.scrollTop > threshold),
    [threshold]
  );
  return { stuck, onScroll, reset: () => setStuck(false) };
}
