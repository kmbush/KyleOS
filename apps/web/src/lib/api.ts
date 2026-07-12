// The API seam: the single place fetch details for the content endpoints live, so
// components and hooks never build URLs or attach headers (DESIGN §8, §9). The
// write path (PUT /content) lands with the editor in Phase 4.
import type { Content } from "./schema";

// GET the content document from CloudFront — same origin as the app, no auth.
export async function getContent(): Promise<Content> {
  const response = await fetch("/content.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load /content.json (HTTP ${response.status})`);
  }
  return (await response.json()) as Content;
}
