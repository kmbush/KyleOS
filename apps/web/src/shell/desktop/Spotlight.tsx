// Spotlight: fuzzy-filter apps, projects, and actions; ↑/↓ move, Enter opens,
// Esc closes, hover highlights. Opened with ⌘K / Ctrl+K or the menu-bar button.
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { HELP, projectApp, SECTIONS, SNAKE } from "../../lib/apps";
import { MOD_KEY } from "../../lib/platform";
import { filterSearch } from "../../lib/search";
import { useContent } from "../../lib/useContent";
import { useTheme } from "../../stores/useTheme";
import { useWindowManager } from "../../stores/useWindowManager";

interface SpotlightItem {
  label: string;
  kind: string;
  glyph: string;
  tint: string;
  run: () => void;
}

export function Spotlight({ onClose }: { onClose: () => void }) {
  const { projects } = useContent();
  const open = useWindowManager((s) => s.open);
  const toggleTheme = useTheme((s) => s.toggle);

  const items = useMemo<SpotlightItem[]>(() => {
    const sections = SECTIONS.map((s) => ({
      label: s.searchLabel,
      kind: "section",
      glyph: s.glyph,
      tint: s.accent,
      run: () => open(s.id, s.windowTitle, s.size),
    }));
    const projectItems = projects.map((p, i) => {
      const app = projectApp(p, i);
      return {
        label: p.name,
        kind: "project",
        glyph: app.glyph,
        tint: app.accent,
        run: () => open(app.id, app.windowTitle, app.size),
      };
    });
    return [
      ...sections,
      ...projectItems,
      {
        label: "Toggle theme",
        kind: "action",
        glyph: "☽",
        tint: "var(--glacier)",
        run: toggleTheme,
      },
      {
        label: HELP.searchLabel,
        kind: "guide",
        glyph: HELP.glyph,
        tint: HELP.accent,
        run: () => open(HELP.id, HELP.windowTitle, HELP.size),
      },
      {
        label: SNAKE.searchLabel,
        kind: "game",
        glyph: SNAKE.glyph,
        tint: SNAKE.accent,
        run: () => open(SNAKE.id, SNAKE.windowTitle, SNAKE.size),
      },
    ];
  }, [projects, open, toggleTheme]);

  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  const results = filterSearch(items, query);
  const selected = Math.min(index, Math.max(0, results.length - 1));

  const run = (item: SpotlightItem | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex(Math.min(selected + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex(Math.max(0, selected - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[selected]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      onMouseDown={onClose}
      className="absolute inset-0 z-[1500] flex justify-center pt-[13vh] backdrop-blur-[7px]"
      style={{ background: "rgba(5, 8, 14, 0.55)" }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-[min(560px,92vw)] self-start overflow-hidden rounded-[16px] border border-line bg-bg2"
        style={{
          boxShadow: "0 40px 90px -34px rgba(0, 0, 0, 0.85)",
          animation: "winIn 0.18s ease",
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-[18px] py-[15px]">
          <span className="font-mono text-[13px] text-moss">{MOD_KEY}K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            placeholder="Search apps, projects, sections…"
            className="flex-1 border-none bg-transparent text-base outline-none"
          />
        </div>
        <div className="max-h-[328px] overflow-y-auto p-2">
          {results.map((item, i) => (
            <button
              key={`${item.kind}:${item.label}`}
              type="button"
              onMouseEnter={() => setIndex(i)}
              onClick={() => run(item)}
              className="flex w-full items-center justify-between gap-[14px] rounded-[9px] px-[13px] py-[11px] text-left text-sm"
              style={{ background: i === selected ? "var(--bg3)" : "transparent" }}
            >
              <span className="flex items-center gap-[11px]">
                <span
                  className="grid size-[26px] place-items-center rounded-[7px] font-mono text-[13px] text-ink"
                  style={{ background: item.tint }}
                >
                  {item.glyph}
                </span>
                {item.label}
              </span>
              <span className="font-mono text-[11px] text-fg-faint">{item.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
