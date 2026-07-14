// The dock: the five section apps, each lifting on hover with an open-indicator
// dot, and any minimized windows as pills after a divider.
import { SECTIONS } from "../../lib/apps";
import { useGlyph } from "../../lib/useGlyphs";
import { useWindowManager } from "../../stores/useWindowManager";

const LIFT =
  "flex flex-col items-center gap-[5px] px-1 py-0.5 transition-transform duration-[180ms] hover:-translate-y-[7px]";

export function Dock() {
  const windows = useWindowManager((s) => s.windows);
  const open = useWindowManager((s) => s.open);
  const restore = useWindowManager((s) => s.restore);
  const glyphOf = useGlyph();

  const openIds = new Set(windows.map((w) => w.id));
  const minimized = windows.filter((w) => w.minimized);

  return (
    <div
      className="absolute bottom-4 left-1/2 z-[650] flex -translate-x-1/2 items-end gap-1.5 rounded-[20px] border border-line px-3 py-[9px] backdrop-blur-[18px]"
      style={{
        background: "color-mix(in oklch, var(--bg2) 70%, transparent)",
        boxShadow: "0 20px 50px -20px rgba(0, 0, 0, 0.6)",
      }}
    >
      {SECTIONS.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => open(app.id, app.windowTitle, app.size)}
          className={LIFT}
        >
          <span
            className="grid size-12 place-items-center rounded-[13px] font-mono text-xl text-ink"
            style={{ background: app.accent }}
          >
            {glyphOf(app)}
          </span>
          <span className="font-mono text-[9.5px] tracking-[0.02em] text-fg-dim">
            {app.dockLabel}
          </span>
          <span
            className="-mt-0.5 size-1 rounded-full"
            style={{ background: openIds.has(app.id) ? "var(--fg)" : "transparent" }}
          />
        </button>
      ))}

      {minimized.length > 0 && <span className="mx-1 h-10 w-px self-center bg-line" />}

      {minimized.map((w) => (
        <button
          key={w.id}
          type="button"
          title={w.title}
          onClick={() => restore(w.id)}
          className={LIFT}
        >
          <span className="grid size-12 place-items-center rounded-[13px] border border-line bg-bg3 font-mono text-base text-fg-dim">
            □
          </span>
          <span className="max-w-14 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9.5px] text-fg-dim">
            {w.title}
          </span>
          <span className="-mt-0.5 size-1 rounded-full bg-amber" />
        </button>
      ))}
    </div>
  );
}
