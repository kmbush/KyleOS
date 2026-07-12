// The desktop shell: wallpaper dot-grid, ambient widgets, and open windows.
// The menu bar, desktop icons, dock, and Spotlight land in the next chunk.
import { useWindowManager } from "../stores/useWindowManager";
import { AmbientWidgets } from "./desktop/AmbientWidgets";
import { Watermark } from "./desktop/Watermark";
import { Window } from "./desktop/Window";

export function DesktopShell() {
  const windows = useWindowManager((s) => s.windows);

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
      {windows
        .filter((w) => !w.minimized)
        .map((w) => (
          <Window key={w.id} win={w} />
        ))}
    </div>
  );
}
