// Dev-only convenience: ensure a local public/config.json exists so `vite dev`
// and the Playwright e2e server can boot on a fresh clone. Production generates
// config.json from Terraform outputs at deploy time (ADR-006); this never runs there.
import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../public/config.json");
const source = resolve(here, "../config.example.json");

if (!existsSync(target)) {
  copyFileSync(source, target);
  console.log("Created public/config.json from config.example.json (dev only).");
}
