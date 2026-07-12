// The mobile shell: status bar plus either the springboard or a single full-
// screen app sheet. One app open at a time, so a plain local state is enough —
// no window manager, no z-order, no dragging (those are desktop-only concerns).
import { useState } from "react";
import type { AppDef } from "../lib/apps";
import { DotGrid } from "./DotGrid";
import { AppSheet } from "./mobile/AppSheet";
import { Springboard } from "./mobile/Springboard";
import { StatusBar } from "./mobile/StatusBar";

export function MobileShell() {
  const [current, setCurrent] = useState<AppDef | null>(null);

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
