// The mobile home: a 4-col app grid (projects + Help) with the KB watermark
// above the app bar, and a floating bottom dock of the five fixed section apps.
import { type AppDef, HELP, projectApp, SECTIONS } from "../../lib/apps";
import { useContent } from "../../lib/useContent";

export function Springboard({ onOpen }: { onOpen: (app: AppDef) => void }) {
  const { projects } = useContent();
  const grid: AppDef[] = [...projects.map((p, i) => projectApp(p, i)), HELP];

  return (
    <div className="absolute inset-x-0 top-10 bottom-0 z-[1] flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[18px] bottom-[150px] z-0 text-right leading-[0.82]"
      >
        <div
          className="font-display text-[150px] font-bold tracking-[-0.04em]"
          style={{ color: "color-mix(in oklch, var(--fg) 6%, transparent)" }}
        >
          KB
        </div>
        <div
          className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em]"
          style={{ color: "color-mix(in oklch, var(--fg) 12%, transparent)" }}
        >
          Pacific NW
        </div>
      </div>

      <div className="relative z-[1] flex-1 content-start overflow-y-auto px-6 pt-8 pb-3">
        <div className="grid grid-cols-4 gap-x-[10px] gap-y-7">
          {grid.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onOpen(app)}
              className="flex flex-col items-center gap-[7px]"
            >
              <span
                className="grid size-[60px] place-items-center rounded-[16px] font-mono text-[25px] text-ink"
                style={{
                  background: app.accent,
                  boxShadow: "0 10px 22px -10px rgba(0, 0, 0, 0.5)",
                }}
              >
                {app.glyph}
              </span>
              <span
                className="max-w-[76px] text-center text-[11px] leading-[1.2]"
                style={{ textShadow: "0 1px 4px rgba(0, 0, 0, 0.45)" }}
              >
                {app.dockLabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-none px-[14px] pt-2 pb-5">
        <div
          className="flex items-center justify-around rounded-[30px] border border-line px-[10px] py-3 backdrop-blur-[22px]"
          style={{ background: "color-mix(in oklch, var(--bg2) 58%, transparent)" }}
        >
          {SECTIONS.map((app) => (
            <button key={app.id} type="button" title={app.dockLabel} onClick={() => onOpen(app)}>
              <span
                className="grid size-[56px] place-items-center rounded-[15px] font-mono text-2xl text-ink"
                style={{ background: app.accent, boxShadow: "0 8px 18px -8px rgba(0, 0, 0, 0.5)" }}
              >
                {app.glyph}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
