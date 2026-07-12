// Mobile status bar (fixed top, 40px): clock left; theme toggle, wifi, battery right.
import { useClock } from "../../lib/useClock";
import { useContent } from "../../lib/useContent";
import { useTheme } from "../../stores/useTheme";

export function StatusBar() {
  const { hero } = useContent();
  const { time } = useClock(hero.timezone);
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);

  return (
    <div className="fixed inset-x-0 top-0 z-[400] flex h-10 items-center justify-between px-[18px] font-mono text-xs text-fg">
      <span className="font-medium">{time}</span>
      <span className="flex items-center gap-[11px] text-fg-dim">
        <button type="button" onClick={toggle} className="text-[13px]">
          {theme === "dark" ? "☽" : "☀"}
        </button>
        <span>●●●○</span>
        <span>▤</span>
      </span>
    </div>
  );
}
