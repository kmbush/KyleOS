// Snake: a tiny arcade game that runs inside a desktop window. A canvas board,
// arrow/WASD steering, grows on food, ends on a wall or itself. Colours are read
// from the theme each frame so it follows light/dark. Keys are captured only while
// the board is focused, so it never fights the editor, Spotlight, or menu shortcuts.
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

const CELLS = 15; // board is CELLS × CELLS
const CELL = 18; // px per cell
const SIZE = CELLS * CELL;
const TICK_MS = 170; // gentle pace — it's an OS demo, not a reflex test
const CENTER = Math.floor(CELLS / 2);

type Point = { x: number; y: number };
type Status = "idle" | "playing" | "over";

// A random cell not currently under the snake.
function randomFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Fast-changing game state lives in refs so the loop mutates it without a render.
  const snake = useRef<Point[]>([{ x: CENTER, y: CENTER }]);
  const dir = useRef<Point>({ x: 1, y: 0 });
  const nextDir = useRef<Point>({ x: 1, y: 0 });
  const food = useRef<Point>({ x: CENTER + 4, y: CENTER });
  const status = useRef<Status>("idle");

  // Mirrored to state only for the score + overlay.
  const [score, setScore] = useState(0);
  const [uiStatus, setUiStatus] = useState<Status>("idle");
  // Displayed board size (px). The canvas backing store stays SIZE and CSS-scales.
  const [board, setBoard] = useState(SIZE);
  const setStatus = useCallback((s: Status) => {
    status.current = s;
    setUiStatus(s);
  }, []);

  const restart = () => {
    snake.current = [{ x: CENTER, y: CENTER }];
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    food.current = randomFood(snake.current);
    setScore(0);
    setStatus("playing");
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const css = getComputedStyle(document.documentElement);
      ctx.fillStyle = css.getPropertyValue("--bg3");
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = css.getPropertyValue("--berry");
      ctx.fillRect(food.current.x * CELL + 3, food.current.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.fillStyle = css.getPropertyValue("--moss");
      for (const s of snake.current) {
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      }
    };

    const step = () => {
      const cur = snake.current[0];
      if (status.current === "playing" && cur) {
        const d = nextDir.current;
        // Apply the buffered turn unless it reverses straight into the neck.
        if (d.x !== -dir.current.x || d.y !== -dir.current.y) dir.current = d;
        const head = { x: cur.x + dir.current.x, y: cur.y + dir.current.y };
        const hitWall = head.x < 0 || head.y < 0 || head.x >= CELLS || head.y >= CELLS;
        const hitSelf = snake.current.some((s) => s.x === head.x && s.y === head.y);
        if (hitWall || hitSelf) {
          setStatus("over");
        } else if (head.x === food.current.x && head.y === food.current.y) {
          snake.current = [head, ...snake.current];
          food.current = randomFood(snake.current);
          setScore((n) => n + 1);
        } else {
          snake.current = [head, ...snake.current.slice(0, -1)];
        }
      }
      draw();
    };

    draw();
    const id = setInterval(step, TICK_MS);
    return () => clearInterval(id);
  }, [setStatus]);

  // Focus the board on open so the keys work without a click.
  useEffect(() => canvasRef.current?.focus(), []);

  // Grow/shrink the board to the largest square that fits the (resizeable) window.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setBoard(Math.max(120, Math.floor(Math.min(width, height))));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const turn = (x: number, y: number) => {
      e.preventDefault();
      if (status.current === "idle") restart();
      nextDir.current = { x, y };
    };
    switch (e.key) {
      case "ArrowUp":
      case "w":
        return turn(0, -1);
      case "ArrowDown":
      case "s":
        return turn(0, 1);
      case "ArrowLeft":
      case "a":
        return turn(-1, 0);
      case "ArrowRight":
      case "d":
        return turn(1, 0);
      case " ":
      case "Enter":
        e.preventDefault();
        if (status.current !== "playing") restart();
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between font-mono text-xs text-fg-dim">
        <span>score {score}</span>
        <span className="text-fg-faint">arrows / wasd</span>
      </div>
      <div ref={wrapRef} className="grid min-h-0 flex-1 place-items-center">
        <div className="relative" style={{ width: board, height: board }}>
          {/* The canvas holds focus so arrow/WASD keys reach the game only while it's
              focused — never fighting the editor, Spotlight, or menu shortcuts. The
              backing store is fixed (SIZE); CSS scales it to fill the resized window. */}
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label="Snake game board"
            className="size-full rounded-[10px] border border-line outline-none"
          />
          {uiStatus !== "playing" && (
            <div
              className="pointer-events-none absolute inset-0 grid place-items-center rounded-[10px] text-center font-mono"
              style={{ background: "color-mix(in oklch, var(--bg) 55%, transparent)" }}
            >
              {uiStatus === "over" ? (
                <div>
                  <div className="mb-1 text-sm text-fg">game over</div>
                  <div className="text-xs text-fg-dim">score {score} · press space</div>
                </div>
              ) : (
                <div className="text-xs text-fg-dim">press space or an arrow to start</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
