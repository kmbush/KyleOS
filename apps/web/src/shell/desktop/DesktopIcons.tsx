// Desktop files: draggable 60px tiles with a 5px accent stripe. Double-click opens
// the window; drag repositions (Reset desktop clears overrides). Project files come
// from content; Snake is a fixed extra tile after them.

import { accentAt } from "../../lib/accents";
import { type AppDef, projectApp, SNAKE } from "../../lib/apps";
import { startDrag } from "../../lib/drag";
import { useContent } from "../../lib/useContent";
import { useWindowManager } from "../../stores/useWindowManager";

function defaultPos(index: number) {
  return { x: 28 + index * 112, y: 52 };
}

interface Icon {
  glyph: string;
  label: string;
  accent: string;
  app: AppDef;
}

export function DesktopIcons() {
  const { projects } = useContent();
  const iconPos = useWindowManager((s) => s.iconPos);
  const moveIcon = useWindowManager((s) => s.moveIcon);
  const open = useWindowManager((s) => s.open);

  const icons: Icon[] = [
    ...projects.map((project, i) => ({
      glyph: project.glyph,
      label: project.name,
      accent: accentAt(i),
      app: projectApp(project, i),
    })),
    { glyph: SNAKE.glyph, label: SNAKE.dockLabel, accent: SNAKE.accent, app: SNAKE },
  ];

  return (
    <>
      {icons.map(({ glyph, label, accent, app }, i) => {
        const pos = iconPos[app.id] ?? defaultPos(i);
        return (
          <button
            key={app.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              startDrag(e, pos, (x, y) => moveIcon(app.id, x, y));
            }}
            onDoubleClick={() => open(app.id, app.windowTitle, app.size)}
            style={{ left: pos.x, top: pos.y, zIndex: 2 }}
            className="absolute flex w-24 flex-col items-center gap-2 p-1"
          >
            <span
              className="relative grid size-[60px] place-items-center overflow-hidden rounded-[14px] border border-line bg-bg2"
              style={{ boxShadow: "0 10px 24px -14px rgba(0, 0, 0, 0.7)" }}
            >
              <span
                className="absolute top-0 left-0 h-[5px] w-full"
                style={{ background: accent }}
              />
              <span className="font-mono text-[22px]" style={{ color: accent }}>
                {glyph}
              </span>
            </span>
            <span
              className="max-w-24 rounded-[5px] px-[5px] py-[2px] text-center font-mono text-[11.5px] leading-[1.25]"
              style={{ background: "color-mix(in oklch, var(--bg) 40%, transparent)" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </>
  );
}
