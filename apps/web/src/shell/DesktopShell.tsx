// The desktop shell: wallpaper, menu bar, ambient widgets, desktop icons, the
// open windows, the dock, and Spotlight (⌘K / Ctrl+K).
import { useEffect, useState } from "react";
import { EDITOR } from "../lib/apps";
import { useAdminHash } from "../lib/useAdminHash";
import { useAuth } from "../stores/useAuth";
import { useWindowManager } from "../stores/useWindowManager";
import { DotGrid } from "./DotGrid";
import { AmbientWidgets } from "./desktop/AmbientWidgets";
import { DesktopIcons } from "./desktop/DesktopIcons";
import { Dock } from "./desktop/Dock";
import { MenuBar } from "./desktop/MenuBar";
import { Spotlight } from "./desktop/Spotlight";
import { Watermark } from "./desktop/Watermark";
import { Window } from "./desktop/Window";

export function DesktopShell() {
  const windows = useWindowManager((s) => s.windows);
  const open = useWindowManager((s) => s.open);
  const close = useWindowManager((s) => s.close);
  const [spotlight, setSpotlight] = useState(false);

  // The editor is an app like any other: open its window once signed in at #admin,
  // and close it when the session ends or #admin is left (ADR-005).
  const isAdmin = useAdminHash();
  const authed = useAuth((s) => s.step === "authed");
  const showEditor = isAdmin && authed;
  useEffect(() => {
    if (showEditor) open(EDITOR.id, EDITOR.windowTitle, EDITOR.size);
    else close(EDITOR.id);
  }, [showEditor, open, close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSpotlight((v) => !v);
      } else if (e.key === "Escape") {
        setSpotlight(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-screen select-none overflow-hidden">
      <DotGrid />
      <MenuBar onOpenSpotlight={() => setSpotlight(true)} />
      <Watermark />
      <AmbientWidgets />
      <DesktopIcons />
      {windows
        .filter((w) => !w.minimized)
        .map((w) => (
          <Window key={w.id} win={w} />
        ))}
      <Dock />
      {spotlight && <Spotlight onClose={() => setSpotlight(false)} />}
    </div>
  );
}
