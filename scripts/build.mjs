/**
 * Routes builds: marketing static export on Cloudflare Pages, full webapp on
 * Render. Cloudflare's git build often sets CI=true but not CF_PAGES_* vars.
 */
import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "..", ".cursor", "debug-5aaf60.log");

const isRenderBuild = Boolean(process.env.RENDER);
const envSnapshot = {
  CF_PAGES: process.env.CF_PAGES ?? null,
  CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH ?? null,
  MARKETING_BUILD: process.env.MARKETING_BUILD ?? null,
  CI: process.env.CI ?? null,
  RENDER: process.env.RENDER ?? null,
  npm_lifecycle_event: process.env.npm_lifecycle_event ?? null,
};

const isPagesBuild =
  process.env.MARKETING_BUILD === "1" ||
  process.env.CF_PAGES === "1" ||
  process.env.CF_PAGES === "true" ||
  Boolean(process.env.CF_PAGES_BRANCH) ||
  (process.env.CI === "true" && !isRenderBuild);

const script = isPagesBuild ? "build:marketing" : "build:webapp";

// #region agent log
const debugEntry = {
  sessionId: "5aaf60",
  runId: "post-fix",
  hypothesisId: "H4",
  location: "scripts/build.mjs:routing",
  message: "build router decision",
  data: { envSnapshot, isRenderBuild, isPagesBuild, script },
  timestamp: Date.now(),
};
try {
  appendFileSync(logPath, `${JSON.stringify(debugEntry)}\n`);
} catch {
  // ignore if log dir missing in CI
}
console.log(
  `[build.mjs] CI=${envSnapshot.CI} RENDER=${envSnapshot.RENDER} CF_PAGES_BRANCH=${envSnapshot.CF_PAGES_BRANCH} -> ${script}`
);
fetch("http://127.0.0.1:7869/ingest/5bb2bbb2-3f4c-45b3-8d61-cfcc30071a75", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "5aaf60",
  },
  body: JSON.stringify(debugEntry),
}).catch(() => {});
// #endregion

const result = spawnSync("npm", ["run", script], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
