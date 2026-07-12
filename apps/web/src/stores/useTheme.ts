// Theme state: 'dark' (default) or 'light'. The store is a pure state container;
// persistence and the [data-theme] swap live in persistTheme so the store stays
// testable without a DOM (DESIGN §9).
import { create } from "zustand";

const STORAGE_KEY = "kyleos-theme";

export type Theme = "dark" | "light";

function readInitialTheme(): Theme {
  if (typeof localStorage === "undefined") return "dark";
  return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const useTheme = create<ThemeStore>((set, get) => ({
  theme: readInitialTheme(),
  setTheme: (theme) => set({ theme }),
  toggle: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
}));

export function persistTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, theme);
}
