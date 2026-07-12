// Desktop project files: draggable 60px tiles with a 5px accent stripe.
// Double-click opens the project window; drag repositions (Reset desktop clears
// overrides back to the default row).
import { accentAt } from "../../lib/accents";
import { projectApp } from "../../lib/apps";
import { startDrag } from "../../lib/drag";
import { useContent } from "../../lib/useContent";
import { useWindowManager } from "../../stores/useWindowManager";

function defaultPos(index: number) {
  return { x: 28 + index * 112, y: 52 };
}

export function DesktopIcons() {
  const { projects } = useContent();
  const iconPos = useWindowManager((s) => s.iconPos);
  const moveIcon = useWindowManager((s) => s.moveIcon);
  const open = useWindowManager((s) => s.open);

  return (
    <>
      {projects.map((project, i) => {
        const pos = iconPos[project.id] ?? defaultPos(i);
        const app = projectApp(project, i);
        const accent = accentAt(i);
        return (
          <button
            key={project.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              startDrag(e, pos, (x, y) => moveIcon(project.id, x, y));
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
                {project.glyph}
              </span>
            </span>
            <span
              className="max-w-24 rounded-[5px] px-[5px] py-[2px] text-center font-mono text-[11.5px] leading-[1.25]"
              style={{ background: "color-mix(in oklch, var(--bg) 40%, transparent)" }}
            >
              {project.name}
            </span>
          </button>
        );
      })}
    </>
  );
}
