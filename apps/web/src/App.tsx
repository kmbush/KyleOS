// Root: applies the theme, shows the boot overlay once, then the desktop shell.
// Phase 2 adds the mobile-shell switch.
import { useEffect, useState } from "react";
import { Boot } from "./shell/Boot";
import { DesktopShell } from "./shell/DesktopShell";
import { persistTheme, useTheme } from "./stores/useTheme";

export function App() {
  const theme = useTheme((s) => s.theme);
  useEffect(() => persistTheme(theme), [theme]);

  const [booting, setBooting] = useState(true);

  return (
    <>
      <DesktopShell />
      {booting && <Boot onDone={() => setBooting(false)} />}
    </>
  );
}
