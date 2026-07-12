// The live clock shared by the menu bar and the ambient clock card. Formats in
// the owner's configured time zone so the desktop shows *their* local time (the
// zone is content, not hardcoded — the repo is public). Re-reads every 15s.
import { useEffect, useState } from "react";

function readTime(timeZone?: string): string {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone });
  } catch {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}

function readDate(timeZone?: string): string {
  try {
    return new Date().toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone,
    });
  } catch {
    return new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }
}

export function useClock(timeZone?: string): { time: string; date: string } {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);
  return { time: readTime(timeZone), date: readDate(timeZone) };
}
