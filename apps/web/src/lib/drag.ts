// Pointer-drag helper shared by windows and desktop icons: capture the grab
// offset on mousedown, then stream new top-left coordinates until mouseup.
import type { MouseEvent as ReactMouseEvent } from "react";

export function startDrag(
  event: ReactMouseEvent,
  origin: { x: number; y: number },
  onMove: (x: number, y: number) => void,
): void {
  const offsetX = event.clientX - origin.x;
  const offsetY = event.clientY - origin.y;
  const move = (e: globalThis.MouseEvent) => onMove(e.clientX - offsetX, e.clientY - offsetY);
  const stop = () => {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
  };
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", stop);
}
