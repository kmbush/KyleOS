// Root: applies the theme, shows the boot overlay once, then the desktop shell.
// After boot, Help auto-opens on the desktop (DESIGN §5). Phase 2 adds the
// mobile-shell switch.
import { useEffect, useState } from "react";
import { HELP } from "./lib/apps";
import { Boot } from "./shell/Boot";
import { DesktopShell } from "./shell/DesktopShell";
import { persistTheme, useTheme } from "./stores/useTheme";
import { useWindowManager } from "./stores/useWindowManager";

export function App() {
  const theme = useTheme((s) => s.theme);
  useEffect(() => persistTheme(theme), [theme]);

  const openApp = useWindowManager((s) => s.open);
  const [booting, setBooting] = useState(true);

  return (
    <>
      <DesktopShell />
      {booting && (
        <Boot
          onDone={() => {
            setBooting(false);
            openApp(HELP.id, HELP.windowTitle, HELP.size);
          }}
        />
      )}
    </>
  );
}
