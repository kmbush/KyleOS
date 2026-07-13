// A desktop window: draggable title bar, traffic lights, and the app body.
// Focus (any mousedown) raises z; maximize fills the viewport minus margins and
// restores to the prior geometry.
import type { MouseEvent as ReactMouseEvent } from "react";
import { AppContent } from "../../apps/AppContent";
import { startDrag } from "../../lib/drag";
import { type DesktopWindow, useWindowManager } from "../../stores/useWindowManager";

const SHADOW = "0 30px 70px -28px rgba(0, 0, 0, 0.7)";

export function Window({ win }: { win: DesktopWindow }) {
  const focus = useWindowManager((s) => s.focus);
  const close = useWindowManager((s) => s.close);
  const minimize = useWindowManager((s) => s.minimize);
  const toggleMax = useWindowManager((s) => s.toggleMax);
  const move = useWindowManager((s) => s.move);
  const resize = useWindowManager((s) => s.resize);

  const frame = win.max
    ? { left: 10, top: 42, width: "calc(100vw - 20px)", height: "calc(100vh - 118px)" }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <div
      data-window={win.id}
      onMouseDown={() => focus(win.id)}
      style={{
        zIndex: win.z,
        ...frame,
        boxShadow: SHADOW,
        animation: "winIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="absolute flex flex-col overflow-hidden rounded-[14px] border border-line bg-bg"
    >
      <div
        onMouseDown={(e) => startDrag(e, { x: win.x, y: win.y }, (x, y) => move(win.id, x, y))}
        className="flex flex-none items-center gap-2 rounded-t-[13px] border-b border-line bg-bg2 px-[14px] py-[11px]"
      >
        <div className="flex items-center gap-2">
          <Light
            accent="var(--berry)"
            glyph="×"
            textSize="text-[10px]"
            title="close"
            onPress={() => close(win.id)}
          />
          <Light
            accent="var(--amber)"
            glyph="−"
            textSize="text-[12px]"
            title="minimize"
            onPress={() => minimize(win.id)}
          />
          <Light
            accent="var(--moss)"
            glyph="+"
            textSize="text-[10px]"
            title="maximize"
            onPress={() => toggleMax(win.id)}
          />
        </div>
        <span className="ml-2 font-mono text-xs text-fg-dim">{win.title}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-[clamp(18px,2.4vw,30px)]">
        <AppContent appId={win.id} />
      </div>

      {!win.max && <ResizeHandles win={win} onResize={(w, h) => resize(win.id, w, h)} />}
    </div>
  );
}

// Resize grips: right edge (width), bottom edge (height), SE corner (both). Each
// treats the window's bottom-right as the dragged point and reports the new size;
// the manager clamps to the minimum. Not shown while maximized.
function ResizeHandles({
  win,
  onResize,
}: {
  win: DesktopWindow;
  onResize: (w: number, h: number) => void;
}) {
  const corner = { x: win.x + win.w, y: win.y + win.h };
  return (
    <>
      <div
        onMouseDown={(e) => startDrag(e, corner, (cx) => onResize(cx - win.x, win.h))}
        className="absolute top-0 right-0 h-full w-[6px] cursor-ew-resize"
      />
      <div
        onMouseDown={(e) => startDrag(e, corner, (_cx, cy) => onResize(win.w, cy - win.y))}
        className="absolute right-0 bottom-0 left-0 h-[6px] cursor-ns-resize"
      />
      <div
        onMouseDown={(e) => startDrag(e, corner, (cx, cy) => onResize(cx - win.x, cy - win.y))}
        className="absolute right-0 bottom-0 size-[14px] cursor-nwse-resize"
      />
    </>
  );
}

function Light({
  accent,
  glyph,
  textSize,
  title,
  onPress,
}: {
  accent: string;
  glyph: string;
  textSize: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e: ReactMouseEvent) => {
        e.stopPropagation();
        onPress();
      }}
      style={{ background: accent }}
      className={`grid size-[14px] cursor-pointer place-items-center rounded-full font-mono leading-none text-transparent hover:text-black/[0.62] ${textSize}`}
    >
      {glyph}
    </button>
  );
}
