import { beforeEach, describe, expect, it } from "vitest";
import { useTheme } from "./useTheme";

beforeEach(() => useTheme.setState({ theme: "dark" }));

describe("useTheme", () => {
  it("defaults to dark", () => {
    expect(useTheme.getState().theme).toBe("dark");
  });

  it("toggles between dark and light", () => {
    useTheme.getState().toggle();
    expect(useTheme.getState().theme).toBe("light");
    useTheme.getState().toggle();
    expect(useTheme.getState().theme).toBe("dark");
  });

  it("sets a specific theme", () => {
    useTheme.getState().setTheme("light");
    expect(useTheme.getState().theme).toBe("light");
  });
});
