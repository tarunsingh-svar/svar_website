/**
 * Routes builds: marketing static export on Cloudflare, full webapp on Render.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isRenderBuild = Boolean(process.env.RENDER);

const isPagesBuild =
  process.env.MARKETING_BUILD === "1" ||
  process.env.CF_PAGES === "1" ||
  process.env.CF_PAGES === "true" ||
  Boolean(process.env.CF_PAGES_BRANCH) ||
  (process.env.CI === "true" && !isRenderBuild);

const script = isPagesBuild ? "build:marketing" : "build:webapp";

const result = spawnSync("npm", ["run", script], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
