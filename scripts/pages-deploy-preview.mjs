/**
 * Preview / non-production Pages deploy.
 */
import { appendFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "..", ".cursor", "debug-5aaf60.log");
const projectName = "svar-marketing";
const branch = process.env.CF_PAGES_BRANCH;

if (!branch) {
  console.error(
    "pages-deploy-preview: CF_PAGES_BRANCH is not set. " +
      "This script is for non-production branch deploys on Cloudflare Pages."
  );
  process.exit(1);
}

if (!existsSync(path.join(root, "out", "index.html"))) {
  console.error(
    "[pages-deploy-preview] Missing out/index.html — run npm run pages:build first."
  );
  process.exit(1);
}

// #region agent log
const debugEntry = {
  sessionId: "5aaf60",
  runId: "deploy-fix",
  hypothesisId: "H7",
  location: "scripts/pages-deploy-preview.mjs:deploy",
  message: "pages preview deploy args",
  data: { branch, projectName, outputDir: "out" },
  timestamp: Date.now(),
};
try {
  appendFileSync(logPath, `${JSON.stringify(debugEntry)}\n`);
} catch {
  // ignore
}
console.log(`[pages-deploy-preview] uploading out/ to ${projectName} branch=${branch}`);
// #endregion

const args = [
  "wrangler",
  "pages",
  "deploy",
  "out",
  "--project-name",
  projectName,
  "--branch",
  branch,
];

const result = spawnSync("npx", args, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
