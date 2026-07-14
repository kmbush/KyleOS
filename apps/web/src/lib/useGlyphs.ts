// The effective icon for an app: the owner's override from content (icons map,
// keyed by app id), else the app's built-in default. One place so the dock, desktop
// icons, Spotlight, and springboard all resolve glyphs the same way. Project apps
// aren't in the icons map, so they fall through to their own projects[].glyph.
import { useCallback } from "react";
import type { AppDef } from "./apps";
import { useContent } from "./useContent";

export function useGlyph(): (app: AppDef) => string {
  const icons = useContent().icons;
  // Stable while content is unchanged, so callers can list it in memo/effect deps.
  return useCallback((app: AppDef) => icons?.[app.id] ?? app.glyph, [icons]);
}
