// Root: applies the theme, shows the boot overlay once, then the desktop or
// mobile shell by viewport. Help auto-opens after boot on the desktop only.
import { useEffect, useState } from "react";
import { HELP } from "./lib/apps";
import { useIsMobile } from "./lib/useIsMobile";
import { Boot } from "./shell/Boot";
import { DesktopShell } from "./shell/DesktopShell";
import { MobileShell } from "./shell/MobileShell";
import { persistTheme, useTheme } from "./stores/useTheme";
import { useWindowManager } from "./stores/useWindowManager";

export function App() {
  const theme = useTheme((s) => s.theme);
  useEffect(() => persistTheme(theme), [theme]);

  const isMobile = useIsMobile();
  const openApp = useWindowManager((s) => s.open);
  const [booting, setBooting] = useState(true);

  return (
    <>
      {isMobile ? <MobileShell /> : <DesktopShell />}
      {booting && (
        <Boot
          onDone={() => {
            setBooting(false);
            if (!isMobile) openApp(HELP.id, HELP.windowTitle, HELP.size);
          }}
        />
      )}
    </>
  );
}
