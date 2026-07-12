// The #admin route (ADR-005): read on load and on every hashchange. Not a security
// boundary — it only decides whether to show the login/editor. The JWT authorizer
// on the write API is what actually protects content.
import { useSyncExternalStore } from "react";

const ADMIN_HASH = "#admin";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getSnapshot(): boolean {
  return typeof window !== "undefined" && window.location.hash === ADMIN_HASH;
}

export function useAdminHash(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
