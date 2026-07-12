// Help: the welcome legend explaining the dock, project files, windows,
// Spotlight (OS-aware hotkey), and the menu bar.
import { MOD_KEY } from "../lib/platform";

const LEGEND = [
  {
    accent: "var(--moss)",
    glyph: "▢",
    title: "Dock",
    body: "(bottom) — open About, Writing, Certs, Life, and Contact.",
  },
  {
    accent: "var(--glacier)",
    glyph: "⋮",
    title: "Project files",
    body: "(top-left) — double-click to open, drag to rearrange.",
  },
  {
    accent: "var(--berry)",
    glyph: "●",
    title: "Windows",
    body: "— drag by the title bar. Red closes, amber minimizes to the dock, green maximizes.",
  },
  {
    accent: "var(--amber)",
    glyph: `${MOD_KEY}K`,
    title: "Spotlight",
    body: `— press ${MOD_KEY}K (or the search button) to search & jump anywhere.`,
  },
  {
    accent: "var(--moss)",
    glyph: "≡",
    title: "Menu bar",
    body: "— File, View, and Go for quick actions; the ◆ menu toggles light / dark.",
  },
];

export function Help() {
  return (
    <>
      <h2 className="m-0 mb-1.5 font-display text-[22px] font-semibold">Welcome to KyleOS</h2>
      <p className="m-0 mb-[18px] text-sm leading-[1.6] text-fg-dim">
        A portfolio that behaves like a desktop. Here's the map:
      </p>
      <div className="grid gap-[11px]">
        {LEGEND.map((row) => (
          <div key={row.title} className="flex items-start gap-3">
            <span
              className="grid size-[30px] flex-none place-items-center rounded-[8px] font-mono text-sm text-ink"
              style={{ background: row.accent }}
            >
              {row.glyph}
            </span>
            <p className="m-0 text-[13.5px] leading-[1.5]">
              <strong>{row.title}</strong> {row.body}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-[18px] font-mono text-[11px] text-fg-faint">
        tip: the ◆ menu toggles light / dark.
      </p>
    </>
  );
}
