/**
 * Production Pages deploy.
 */
import { appendFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "..", ".cursor", "debug-5aaf60.log");
const projectName = "svar-marketing";
const outputDir = path.join(root, "out");

if (!existsSync(path.join(outputDir, "index.html"))) {
  console.error(
    `[pages-deploy] Missing ${outputDir}/index.html — run npm run pages:build first.`
  );
  process.exit(1);
}

const authSnapshot = {
  hasApiToken: Boolean(process.env.CLOUDFLARE_API_TOKEN),
  hasAccountId: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID),
  cfPagesBranch: process.env.CF_PAGES_BRANCH ?? null,
  outputDir: "out",
};

// #region agent log
const debugEntry = {
  sessionId: "5aaf60",
  runId: "deploy-fix",
  hypothesisId: "H7",
  location: "scripts/pages-deploy.mjs:deploy",
  message: "pages deploy args",
  data: authSnapshot,
  timestamp: Date.now(),
};
try {
  appendFileSync(logPath, `${JSON.stringify(debugEntry)}\n`);
} catch {
  // ignore
}
console.log(
  `[pages-deploy] uploading out/ to ${projectName} (token=${authSnapshot.hasApiToken ? "set" : "unset"})`
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

// Note: pages deploy does NOT accept --account-id. Wrangler reads
// CLOUDFLARE_ACCOUNT_ID from the environment when needed.
const args = [
  "wrangler",
  "pages",
  "deploy",
  "out",
  "--project-name",
  projectName,
];

const result = spawnSync("npx", args, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
