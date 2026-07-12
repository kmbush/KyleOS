// Generates src/lib/schema.json (JSON Schema, draft-07) from the authored Content
// interface in src/lib/schema.ts — the single source of truth (ADR-009). Run via
// `npm run schema:gen`; the same generation is re-run in memory by schema.test.ts
// to prove the committed file never drifts from the type.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createGenerator } from "ts-json-schema-generator";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, "../src/lib/schema.json");

// `additionalProperties: false` locks every object shut so the Lambda rejects
// unknown keys; `image?` stays optional because it is absent from `required`.
export function generateSchema() {
  return createGenerator({
    path: resolve(here, "../src/lib/schema.ts"),
    type: "Content",
    additionalProperties: false,
  }).createSchema("Content");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(schemaPath, `${JSON.stringify(generateSchema(), null, 2)}\n`);
  console.log("Generated src/lib/schema.json from schema.ts");
}
