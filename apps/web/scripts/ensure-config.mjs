// Dev-only convenience: seed local public/{config,content}.json so `vite dev` and
// the Playwright e2e server can boot and fetch them on a fresh clone. Production
// serves these from S3/CloudFront (ADR-006); this never runs there. Both files are
// gitignored, so a real value can never be committed through them.
import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function seed(target, source) {
  const to = resolve(here, "../public", target);
  if (!existsSync(to)) {
    copyFileSync(resolve(here, "..", source), to);
    console.log(`Created public/${target} from ${source} (dev only).`);
  }
}

seed("config.json", "config.example.json");
seed("content.json", "content.example.json");
