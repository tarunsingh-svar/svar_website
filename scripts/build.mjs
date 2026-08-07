/**
 * Cloudflare Pages sets CF_PAGES=1 during builds. Route to the marketing
 * static export there; use the full Next.js build everywhere else (Render).
 */
import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "..", ".cursor", "debug-5aaf60.log");

const envSnapshot = {
  CF_PAGES: process.env.CF_PAGES ?? null,
  CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH ?? null,
  MARKETING_BUILD: process.env.MARKETING_BUILD ?? null,
  CI: process.env.CI ?? null,
  npm_lifecycle_event: process.env.npm_lifecycle_event ?? null,
};

const isPagesBuild =
  process.env.MARKETING_BUILD === "1" ||
  process.env.CF_PAGES === "1" ||
  process.env.CF_PAGES === "true" ||
  Boolean(process.env.CF_PAGES_BRANCH);

const script = isPagesBuild ? "build:marketing" : "build:webapp";

// #region agent log
const debugEntry = {
  sessionId: "5aaf60",
  runId: "pre-fix",
  hypothesisId: "H1-H3",
  location: "scripts/build.mjs:routing",
  message: "build router decision",
  data: { envSnapshot, isPagesBuild, script },
  timestamp: Date.now(),
};
try {
  appendFileSync(logPath, `${JSON.stringify(debugEntry)}\n`);
} catch {
  // ignore if log dir missing in CI
}
console.log(
  `[build.mjs] CF_PAGES=${envSnapshot.CF_PAGES} CF_PAGES_BRANCH=${envSnapshot.CF_PAGES_BRANCH} -> ${script}`
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
