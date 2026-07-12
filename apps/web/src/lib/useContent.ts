// Access to the content document. Phase 1 serves the bundled example straight
// from the repo; Phase 3 swaps this single seam for a TanStack Query fetch of
// /content.json (DESIGN §9). Consumers depend only on this hook.
//
// The typed binding also doubles as a compile-time check that the example
// conforms to the schema — a mismatch fails `tsc`.
import exampleContent from "../../content.example.json";
import type { Content } from "./schema";

const content: Content = exampleContent;

export function useContent(): Content {
  return content;
}
