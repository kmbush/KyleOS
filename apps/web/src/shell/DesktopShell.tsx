// The desktop shell: wallpaper dot-grid, ambient widgets, and (added in later
// chunks) the menu bar, desktop icons, windows, dock, and Spotlight.
import { AmbientWidgets } from "./desktop/AmbientWidgets";
import { Watermark } from "./desktop/Watermark";

export function DesktopShell() {
  return (
    <div className="relative h-screen select-none overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-45"
        style={{
          backgroundImage: "radial-gradient(var(--line) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <Watermark />
      <AmbientWidgets />
    </div>
  );
}
