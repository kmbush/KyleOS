// The app catalog: one source of truth for every openable app's title, glyph,
// accent, and default window size. The dock, desktop icons, menu bar, and
// Spotlight all read from here so nothing drifts.
import { accentAt } from "./accents";

export interface AppDef {
  id: string; // the key the window manager and shell render
  windowTitle: string; // shown in the window title bar
  dockLabel: string; // dock / icon label
  searchLabel: string; // menu + Spotlight label (can differ, e.g. "Certifications")
  glyph: string;
  accent: string; // a CSS accent variable
  size: { w: number; h: number };
}

// The five dock apps, in order.
export const SECTIONS: AppDef[] = [
  {
    id: "about",
    windowTitle: "About",
    dockLabel: "About",
    searchLabel: "About",
    glyph: "⌂",
    accent: "var(--moss)",
    size: { w: 520, h: 460 },
  },
  {
    id: "writing",
    windowTitle: "Writing",
    dockLabel: "Writing",
    searchLabel: "Writing",
    glyph: "✎",
    accent: "var(--glacier)",
    size: { w: 520, h: 440 },
  },
  {
    id: "certs",
    windowTitle: "Certs",
    dockLabel: "Certs",
    searchLabel: "Certifications",
    glyph: "✓",
    accent: "var(--amber)",
    size: { w: 520, h: 420 },
  },
  {
    id: "life",
    windowTitle: "Life",
    dockLabel: "Life",
    searchLabel: "Life",
    glyph: "⛰",
    accent: "var(--berry)",
    size: { w: 500, h: 400 },
  },
  {
    id: "contact",
    windowTitle: "Contact",
    dockLabel: "Contact",
    searchLabel: "Contact",
    glyph: "✉",
    accent: "var(--moss)",
    size: { w: 480, h: 560 },
  },
];

export const HELP: AppDef = {
  id: "help",
  windowTitle: "Help",
  dockLabel: "Help",
  searchLabel: "Help",
  glyph: "?",
  accent: "var(--moss)",
  size: { w: 470, h: 500 },
};

// The content editor (Phase 4). Hidden — reachable only via #admin, so it is not
// in the dock, desktop icons, or Spotlight.
export const EDITOR: AppDef = {
  id: "editor",
  windowTitle: "Content Editor",
  dockLabel: "Editor",
  searchLabel: "Content Editor",
  glyph: "✎",
  accent: "var(--moss)",
  size: { w: 720, h: 620 },
};

export const INFO: AppDef = {
  id: "info",
  windowTitle: "About KyleOS",
  dockLabel: "About KyleOS",
  searchLabel: "About KyleOS",
  glyph: "K",
  accent: "var(--moss)",
  size: { w: 400, h: 380 },
};

// A playable Snake game — a desktop icon and a Spotlight entry, not a portfolio section.
export const SNAKE: AppDef = {
  id: "snake",
  windowTitle: "Snake",
  dockLabel: "Snake",
  searchLabel: "Snake",
  glyph: "▦",
  accent: "var(--glacier)",
  size: { w: 340, h: 420 },
};

// Built-in apps whose icon the owner can override in the editor (Icons section).
// Project icons are edited per-project in Work, so they are not listed here.
export const ICON_APPS: AppDef[] = [...SECTIONS, HELP, SNAKE];

/** The app for a project, keyed `proj:<id>`, its accent cycling by list index. */
export function projectApp(
  project: { id: string; name: string; glyph: string },
  index: number,
): AppDef {
  return {
    id: `proj:${project.id}`,
    windowTitle: `${project.name}.app`,
    dockLabel: project.name,
    searchLabel: project.name,
    glyph: project.glyph,
    accent: accentAt(index),
    size: { w: 600, h: 540 },
  };
}
