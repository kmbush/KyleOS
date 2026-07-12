import { beforeEach, describe, expect, it } from "vitest";
import { useWindowManager } from "./useWindowManager";

const wm = () => useWindowManager.getState();
const size = { w: 400, h: 300 };

/** The single open window; throws if the invariant a test relies on is broken. */
function only() {
  const win = wm().windows[0];
  if (!win) throw new Error("expected exactly one window");
  return win;
}

beforeEach(() => useWindowManager.setState({ windows: [], z: 10, iconPos: {} }));

describe("useWindowManager", () => {
  it("opens a window and focuses it", () => {
    wm().open("about", "About", size);
    expect(wm().windows).toHaveLength(1);
    expect(only()).toMatchObject({ id: "about", title: "About", minimized: false, max: false });
    expect(only().z).toBe(wm().z);
  });

  it("re-opening an app raises its z instead of duplicating", () => {
    wm().open("about", "About", size);
    wm().open("writing", "Writing", size);
    const zBefore = wm().windows.find((w) => w.id === "about")?.z ?? 0;
    wm().open("about", "About", size);
    expect(wm().windows).toHaveLength(2);
    const about = wm().windows.find((w) => w.id === "about");
    expect(about?.z).toBe(wm().z);
    expect(about?.z).toBeGreaterThan(zBefore);
  });

  it("focus brings a window to the front", () => {
    wm().open("a", "A", size);
    wm().open("b", "B", size);
    wm().focus("a");
    const a = wm().windows.find((w) => w.id === "a")?.z ?? 0;
    const b = wm().windows.find((w) => w.id === "b")?.z ?? 0;
    expect(a).toBeGreaterThan(b);
  });

  it("minimizes and restores", () => {
    wm().open("a", "A", size);
    wm().minimize("a");
    expect(only().minimized).toBe(true);
    wm().restore("a");
    expect(only().minimized).toBe(false);
    expect(only().z).toBe(wm().z);
  });

  it("maximize saves geometry and restore returns to it", () => {
    wm().open("a", "A", size);
    const before = { x: only().x, y: only().y, w: only().w, h: only().h };
    wm().toggleMax("a");
    expect(only().max).toBe(true);
    expect(only()).toMatchObject({ rx: before.x, ry: before.y, rw: before.w, rh: before.h });
    wm().toggleMax("a");
    expect(only().max).toBe(false);
    expect(only()).toMatchObject(before);
  });

  it("move clamps y below the menu bar", () => {
    wm().open("a", "A", size);
    wm().move("a", 500, 5);
    expect(only()).toMatchObject({ x: 500, y: 40 });
  });

  it("moveIcon clamps y and records the position", () => {
    wm().moveIcon("p1", 120, 10);
    expect(wm().iconPos.p1).toEqual({ x: 120, y: 42 });
  });

  it("close, closeAll, and resetDesktop clear state", () => {
    wm().open("a", "A", size);
    wm().open("b", "B", size);
    wm().moveIcon("p1", 100, 100);
    wm().close("a");
    expect(wm().windows.map((w) => w.id)).toEqual(["b"]);
    wm().closeAll();
    expect(wm().windows).toHaveLength(0);
    wm().open("c", "C", size);
    wm().resetDesktop();
    expect(wm().windows).toHaveLength(0);
    expect(wm().iconPos).toEqual({});
  });
});
