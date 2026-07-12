// The live clock shared by the menu bar and the ambient clock card. Minute
// precision, re-read every 15s (the spec's tick), so both stay in sync.
import { useEffect, useState } from "react";

function readTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function readDate(): string {
  return new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function useClock(): { time: string; date: string } {
  const [now, setNow] = useState(() => ({ time: readTime(), date: readDate() }));
  useEffect(() => {
    const id = setInterval(() => setNow({ time: readTime(), date: readDate() }), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
