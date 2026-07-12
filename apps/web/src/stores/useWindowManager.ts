// The window manager: the desktop's window list, z-order, and desktop-icon
// positions, plus every action that mutates them (DESIGN §9). Pure state — the
// Window and DesktopIcons components own the pointer math and rendering.
import { create } from "zustand";

/** Windows and icons stay below the 36px menu bar. */
const TOP_LIMIT = 40;
const ICON_TOP_LIMIT = 42;
const BASE_Z = 10;

export interface DesktopWindow {
  id: string; // also the app key the shell renders
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  max: boolean;
  // Geometry saved on maximize, restored on un-maximize.
  rx: number;
  ry: number;
  rw: number;
  rh: number;
}

interface WindowManager {
  windows: DesktopWindow[];
  z: number;
  iconPos: Record<string, { x: number; y: number }>;
  open: (app: string, title: string, size: { w: number; h: number }) => void;
  focus: (id: string) => void;
  close: (id: string) => void;
  closeAll: () => void;
  restart: () => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleMax: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  moveIcon: (id: string, x: number, y: number) => void;
  resetDesktop: () => void;
}

function viewportWidth(): number {
  return typeof window !== "undefined" ? window.innerWidth : 1200;
}

export const useWindowManager = create<WindowManager>((set) => ({
  windows: [],
  z: BASE_Z,
  iconPos: {},

  open: (app, title, size) =>
    set((s) => {
      const z = s.z + 1;
      if (s.windows.some((w) => w.id === app)) {
        return { z, windows: s.windows.map((w) => (w.id === app ? { ...w, z } : w)) };
      }
      const idx = s.windows.length;
      const viewport = viewportWidth();
      const x = Math.min(
        Math.max(150, viewport * 0.5 - size.w / 2 + idx * 26),
        Math.max(150, viewport - size.w - 40),
      );
      const y = 84 + idx * 24;
      const win: DesktopWindow = {
        id: app,
        title,
        x,
        y,
        w: size.w,
        h: size.h,
        z,
        minimized: false,
        max: false,
        rx: x,
        ry: y,
        rw: size.w,
        rh: size.h,
      };
      return { z, windows: [...s.windows, win] };
    }),

  focus: (id) =>
    set((s) => {
      const z = s.z + 1;
      return { z, windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)) };
    }),

  close: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  closeAll: () => set({ windows: [] }),

  restart: () => set({ windows: [], z: BASE_Z }),

  minimize: (id) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) })),

  restore: (id) =>
    set((s) => {
      const z = s.z + 1;
      return {
        z,
        windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false, z } : w)),
      };
    }),

  toggleMax: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w;
        return w.max
          ? { ...w, max: false, x: w.rx, y: w.ry, w: w.rw, h: w.rh }
          : { ...w, max: true, rx: w.x, ry: w.y, rw: w.w, rh: w.h };
      }),
    })),

  move: (id, x, y) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, x, y: Math.max(TOP_LIMIT, y) } : w)),
    })),

  moveIcon: (id, x, y) =>
    set((s) => ({ iconPos: { ...s.iconPos, [id]: { x, y: Math.max(ICON_TOP_LIMIT, y) } } })),

  resetDesktop: () => set({ windows: [], iconPos: {} }),
}));
