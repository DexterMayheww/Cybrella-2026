// src/hooks/useClickOutside.ts
import { useEffect, RefObject } from "react";

// Use a Generic <T> that extends HTMLElement or null
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>, 
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      // The el.contains check now safely handles the null state
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}