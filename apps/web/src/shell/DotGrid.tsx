// The 30px dot-grid overlay on the wallpaper, shared by both shells.
export function DotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-45"
      style={{
        backgroundImage: "radial-gradient(var(--line) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    />
  );
}
