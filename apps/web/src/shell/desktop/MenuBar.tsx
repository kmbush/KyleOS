// The top menu bar: the ◆ KyleOS / File / View / Go dropdowns and the right
// cluster (help, search, socials, wifi glyph, theme toggle, live clock).
import { useEffect, useRef, useState } from "react";
import { GitHubMark, LinkedInMark } from "../../components/SocialIcons";
import { type AppDef, HELP, INFO, projectApp, SECTIONS } from "../../lib/apps";
import { MOD_KEY } from "../../lib/platform";
import { useClock } from "../../lib/useClock";
import { useContent } from "../../lib/useContent";
import { useTheme } from "../../stores/useTheme";
import { useWindowManager } from "../../stores/useWindowManager";

interface MenuItem {
  label: string;
  hint?: string;
  onSelect: () => void;
}

interface MenuDef {
  key: string;
  label: string;
  bold?: boolean;
  items: MenuItem[];
}

export function MenuBar({ onOpenSpotlight }: { onOpenSpotlight: () => void }) {
  const { time } = useClock();
  const { contact, projects } = useContent();
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const toggleTheme = useTheme((s) => s.toggle);
  const open = useWindowManager((s) => s.open);
  const closeAll = useWindowManager((s) => s.closeAll);
  const resetDesktop = useWindowManager((s) => s.resetDesktop);
  const restart = useWindowManager((s) => s.restart);

  const openApp = (app: AppDef) => open(app.id, app.windowTitle, app.size);

  const [active, setActive] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Close an open menu on an outside click or Escape.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const menus: MenuDef[] = [
    {
      key: "apple",
      label: "◆ KyleOS",
      bold: true,
      items: [
        { label: "About KyleOS", onSelect: () => openApp(INFO) },
        { label: "Help", onSelect: () => openApp(HELP) },
        { label: "Toggle theme", hint: `${MOD_KEY}T`, onSelect: toggleTheme },
        { label: "Restart", onSelect: restart },
      ],
    },
    {
      key: "file",
      label: "File",
      items: [
        { label: "Close all windows", hint: "esc", onSelect: closeAll },
        { label: "Reset desktop", onSelect: resetDesktop },
      ],
    },
    {
      key: "view",
      label: "View",
      items: [
        { label: "Dark theme", onSelect: () => setTheme("dark") },
        { label: "Light theme", onSelect: () => setTheme("light") },
      ],
    },
    {
      key: "go",
      label: "Go",
      items: [
        ...SECTIONS.map((s) => ({ label: s.searchLabel, onSelect: () => openApp(s) })),
        ...projects.map((p, i) => {
          const app = projectApp(p, i);
          return { label: app.windowTitle, onSelect: () => openApp(app) };
        }),
      ],
    },
  ];

  return (
    <div
      ref={barRef}
      className="absolute inset-x-0 top-0 z-[700] flex h-9 items-center gap-0.5 border-b border-line px-[14px] text-[13px] backdrop-blur-[16px]"
      style={{ background: "color-mix(in oklch, var(--bg2) 68%, transparent)" }}
    >
      {menus.map((menu) => (
        <div key={menu.key} className="relative">
          <button
            type="button"
            onClick={() => setActive((a) => (a === menu.key ? null : menu.key))}
            className={`rounded-[7px] px-[11px] py-1.5 hover:bg-bg3 ${menu.bold ? "font-bold" : ""} ${active === menu.key ? "bg-bg3" : ""}`}
          >
            {menu.label}
          </button>
          {active === menu.key && (
            <div
              className="absolute top-9 left-0 z-[800] min-w-[210px] rounded-[11px] border border-line bg-bg2 p-1.5"
              style={{
                boxShadow: "0 24px 60px -24px rgba(0, 0, 0, 0.8)",
                animation: "menuIn 0.16s ease",
              }}
            >
              {menu.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActive(null);
                    item.onSelect();
                  }}
                  className="flex w-full items-center justify-between gap-[14px] rounded-[7px] px-[11px] py-2 text-left text-[13px] hover:bg-bg3"
                >
                  {item.label}
                  {item.hint && (
                    <span className="font-mono text-[11px] text-fg-faint">{item.hint}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <span className="ml-auto flex items-center gap-4 font-mono text-xs text-fg-dim">
        <button
          type="button"
          title="How to use KyleOS"
          onClick={() => openApp(HELP)}
          className="rounded-[7px] border border-line px-[9px] py-[3px] hover:bg-bg3"
        >
          ?
        </button>
        <button
          type="button"
          title={`Search (${MOD_KEY}K)`}
          onClick={onOpenSpotlight}
          className="rounded-[7px] border border-line px-[9px] py-0.5 text-sm hover:bg-bg3"
        >
          ⌕
        </button>
        <a
          href={contact.github}
          target="_blank"
          rel="noopener"
          title="GitHub"
          className="grid size-7 place-items-center rounded-lg border border-line transition-colors duration-[180ms] hover:border-moss hover:bg-bg3 hover:text-fg"
        >
          <GitHubMark />
        </a>
        <a
          href={contact.linkedin}
          target="_blank"
          rel="noopener"
          title="LinkedIn"
          className="grid size-7 place-items-center rounded-lg border border-line transition-colors duration-[180ms] hover:border-moss hover:bg-bg3 hover:text-fg"
        >
          <LinkedInMark />
        </a>
        <span>●●●○</span>
        <button type="button" onClick={toggleTheme} className="text-[13px]">
          {theme === "dark" ? "☽" : "☀"}
        </button>
        <span className="text-fg">{time}</span>
      </span>
    </div>
  );
}
