// The mobile shell: status bar plus either the springboard or a single full-
// screen app sheet. One app open at a time, so a plain local state is enough —
// no window manager, no z-order, no dragging (those are desktop-only concerns).
import { useEffect, useState } from "react";
import { type AppDef, EDITOR } from "../lib/apps";
import { useAdminHash } from "../lib/useAdminHash";
import { useAuth } from "../stores/useAuth";
import { DotGrid } from "./DotGrid";
import { AppSheet } from "./mobile/AppSheet";
import { Springboard } from "./mobile/Springboard";
import { StatusBar } from "./mobile/StatusBar";

export function MobileShell() {
  const [current, setCurrent] = useState<AppDef | null>(null);

  // Open the editor as a sheet once signed in at #admin; drop it when the session
  // ends or #admin is left (ADR-005).
  const isAdmin = useAdminHash();
  const authed = useAuth((s) => s.step === "authed");
  const showEditor = isAdmin && authed;
  useEffect(() => {
    if (showEditor) setCurrent(EDITOR);
    else setCurrent((c) => (c?.id === EDITOR.id ? null : c));
  }, [showEditor]);

  return (
    <div className="relative h-screen select-none overflow-hidden">
      <DotGrid />
      <StatusBar />
      {current === null ? (
        <Springboard onOpen={setCurrent} />
      ) : (
        <AppSheet app={current} onBack={() => setCurrent(null)} />
      )}
    </div>
  );
}
