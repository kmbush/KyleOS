import { describe, expect, it } from "vitest";
import { filterSearch } from "./search";

const items = [
  { label: "About", kind: "section" },
  { label: "Cedar", kind: "project" },
  { label: "Toggle theme", kind: "action" },
];

describe("filterSearch", () => {
  it("returns everything for a blank query", () => {
    expect(filterSearch(items, "")).toEqual(items);
    expect(filterSearch(items, "   ")).toHaveLength(3);
  });

  it("matches the label case-insensitively", () => {
    expect(filterSearch(items, "CEDAR")).toEqual([{ label: "Cedar", kind: "project" }]);
  });

  it("matches on kind as well as label", () => {
    expect(filterSearch(items, "section").map((i) => i.label)).toEqual(["About"]);
  });

  it("returns [] when nothing matches", () => {
    expect(filterSearch(items, "zzz")).toEqual([]);
  });
});
