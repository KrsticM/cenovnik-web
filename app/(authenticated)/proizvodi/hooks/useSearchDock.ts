import { RefObject, useEffect, useState } from "react";

const DOCK_TOP = 12;
const HEADER_HEIGHT = 68;

// Desktop docks when the hero placeholder reaches the header; below lg the placeholder
// is display:none, so docking follows the hero band scrolling under the header instead.
export function useSearchDock(
  bandRef: RefObject<HTMLElement | null>,
  bandFieldRef: RefObject<HTMLElement | null>
) {
  const [slotTop, setSlotTop] = useState(0);
  const [docked, setDocked] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      setNarrow(window.innerWidth < 1280);
      const field = bandFieldRef.current?.getBoundingClientRect();
      if (field && field.height > 0) {
        setSlotTop(Math.round(field.top + window.scrollY));
        setDocked(field.top <= DOCK_TOP);
        return;
      }
      const band = bandRef.current?.getBoundingClientRect();
      setDocked(band ? band.bottom <= HEADER_HEIGHT + 2 : false);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [bandRef, bandFieldRef]);

  return { slotTop, docked, narrow };
}
