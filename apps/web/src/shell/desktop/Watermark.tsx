// The giant "KB" watermark, bottom-right, with a Pacific Northwest caption.
export function Watermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-[2vw] bottom-[4vh] z-0 text-right leading-[0.82]"
    >
      <div
        className="font-display font-bold tracking-[-0.04em] text-[clamp(90px,17vw,300px)]"
        style={{ color: "color-mix(in oklch, var(--fg) 5%, transparent)" }}
      >
        KB
      </div>
      <div
        className="mt-1.5 font-mono uppercase tracking-[0.3em] text-[clamp(11px,1.2vw,14px)]"
        style={{ color: "color-mix(in oklch, var(--fg) 12%, transparent)" }}
      >
        Pacific Northwest
      </div>
    </div>
  );
}
