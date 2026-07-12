// Layout switch: true at ≤820px. Drives desktop-shell vs mobile-shell selection
// (DESIGN §9). useSyncExternalStore keeps it in sync across resizes with no effect.
import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 820px)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
