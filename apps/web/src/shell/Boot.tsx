// The boot overlay: a moss "K" tile, a caption, and a bar that fills over 1.4s.
// It dismisses after 1500ms (DESIGN §5) and calls onDone.
import { useEffect } from "react";

export function Boot({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 1500);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div
      className="absolute inset-0 z-[2000] flex flex-col items-center justify-center gap-5"
      style={{ background: "linear-gradient(180deg, var(--boot-bg-top), var(--boot-bg-bottom))" }}
    >
      <div
        className="grid size-16 place-items-center rounded-2xl bg-moss font-mono text-[30px] font-bold text-ink"
        style={{ boxShadow: "0 0 55px -6px var(--moss)" }}
      >
        K
      </div>
      <div className="font-mono text-xs uppercase tracking-[0.24em] text-fg-dim">
        booting KyleOS
      </div>
      <div className="h-[3px] w-[180px] overflow-hidden rounded-[3px] bg-line">
        <div
          className="h-full w-full origin-left bg-moss"
          style={{ animation: "bootBar 1.4s cubic-bezier(0.4, 0, 0.2, 1) both" }}
        />
      </div>
    </div>
  );
}
