import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { generateSchema } from "../../scripts/gen-schema.mjs";

// Guards ADR-009: schema.json is generated from schema.ts, so editing the type
// without running `npm run schema:gen` must fail CI. We regenerate in memory and
// deep-equal the parsed committed file (not bytes — Biome reformats it freely).
describe("schema.json", () => {
  // 30s timeout: generateSchema() builds and type-checks a full TypeScript
  // program via ts-json-schema-generator, which exceeds Vitest's 5s default on a
  // cold CI runner. Scoped to this test so real hangs elsewhere still fail fast.
  it("matches the schema generated from schema.ts", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const committed = JSON.parse(readFileSync(resolve(here, "schema.json"), "utf8"));
    expect(generateSchema()).toEqual(committed);
  }, 30_000);
});
