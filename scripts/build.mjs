/**
 * Cloudflare Pages sets CF_PAGES=1 during builds. Route to the marketing
 * static export there; use the full Next.js build everywhere else (Render).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isPagesBuild =
  process.env.CF_PAGES === "1" || process.env.MARKETING_BUILD === "1";

const script = isPagesBuild ? "build:marketing" : "build:webapp";

const result = spawnSync("npm", ["run", script], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
