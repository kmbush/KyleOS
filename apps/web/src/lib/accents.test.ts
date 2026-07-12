import { describe, expect, it } from "vitest";
import { accentAt } from "./accents";

describe("accentAt", () => {
  it("cycles the four accents by index mod 4", () => {
    expect([0, 1, 2, 3, 4, 5].map(accentAt)).toEqual([
      "var(--moss)",
      "var(--glacier)",
      "var(--berry)",
      "var(--amber)",
      "var(--moss)",
      "var(--glacier)",
    ]);
  });
});
