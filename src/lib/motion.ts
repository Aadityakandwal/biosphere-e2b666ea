import { useEffect, useState } from "react";
import { usePrefs } from "./stores";

/**
 * True once the client has mounted (and persisted stores have rehydrated).
 * Used to show skeletons instead of server/default data on first paint.
 */
export function useHydrated(minDelayMs = 350) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), minDelayMs);
    return () => clearTimeout(t);
  }, [minDelayMs]);
  return hydrated;
}

/** Resolves the user's motion preference (explicit override, else OS setting). */
export function useReducedMotion() {
  const pref = usePrefs((s) => s.reducedMotion);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return pref === "on" ? true : pref === "off" ? false : systemReduced;
}

/** Keeps a `reduce-motion` class on <html> so CSS can drop heavy animations. */
export function useApplyReducedMotion() {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced);
  }, [reduced]);
  return reduced;
}
