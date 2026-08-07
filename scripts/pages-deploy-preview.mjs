/**
 * Preview / non-production Pages deploy. Cloudflare sets CF_PAGES_BRANCH
 * during builds for non-production branches.
 */
import { appendFileSync } from "node:fs";
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

// #region agent log
const debugEntry = {
  sessionId: "5aaf60",
  runId: "deploy-auth",
  hypothesisId: "H5-H6",
  location: "scripts/pages-deploy-preview.mjs:auth",
  message: "pages preview deploy auth snapshot",
  data: {
    branch,
    hasApiToken: Boolean(process.env.CLOUDFLARE_API_TOKEN),
    hasAccountId: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID),
  },
  timestamp: Date.now(),
};
try {
  appendFileSync(logPath, `${JSON.stringify(debugEntry)}\n`);
} catch {
  // ignore
}
// #endregion

const args = [
  "wrangler",
  "pages",
  "deploy",
  "--project-name",
  projectName,
  "--branch",
  branch,
];
if (process.env.CLOUDFLARE_ACCOUNT_ID) {
  args.push("--account-id", process.env.CLOUDFLARE_ACCOUNT_ID);
}

const result = spawnSync("npx", args, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
