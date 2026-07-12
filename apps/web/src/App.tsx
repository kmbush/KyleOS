// Root: applies the theme, shows the boot overlay once, then the desktop or
// mobile shell by viewport. Help auto-opens after boot on the desktop only. The
// #admin login modal overlays both shells until the owner is signed in (ADR-005).
import { useEffect, useState } from "react";
import { LoginGate } from "./auth/LoginGate";
import { HELP } from "./lib/apps";
import { useAdminHash } from "./lib/useAdminHash";
import { useIsMobile } from "./lib/useIsMobile";
import { Boot } from "./shell/Boot";
import { DesktopShell } from "./shell/DesktopShell";
import { MobileShell } from "./shell/MobileShell";
import { useAuth } from "./stores/useAuth";
import { persistTheme, useTheme } from "./stores/useTheme";
import { useWindowManager } from "./stores/useWindowManager";

export function App() {
  const theme = useTheme((s) => s.theme);
  useEffect(() => persistTheme(theme), [theme]);

  const isMobile = useIsMobile();
  const openApp = useWindowManager((s) => s.open);
  const [booting, setBooting] = useState(true);

  const isAdmin = useAdminHash();
  const authed = useAuth((s) => s.step === "authed");

  const closeAdmin = () => {
    useAuth.getState().cancel();
    if (typeof window !== "undefined") window.location.hash = "";
  };

  return (
    <>
      {isMobile ? <MobileShell /> : <DesktopShell />}
      {isAdmin && !authed && <LoginGate onClose={closeAdmin} />}
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
