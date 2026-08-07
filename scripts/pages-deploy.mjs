/**
 * Production Pages deploy. Output dir comes from wrangler.toml
 * (pages_build_output_dir = "./out").
 */
import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "..", ".cursor", "debug-5aaf60.log");
const projectName = "svar-marketing";

const authSnapshot = {
  hasApiToken: Boolean(process.env.CLOUDFLARE_API_TOKEN),
  hasAccountId: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID),
  cfPagesBranch: process.env.CF_PAGES_BRANCH ?? null,
};

// #region agent log
const debugEntry = {
  sessionId: "5aaf60",
  runId: "deploy-auth",
  hypothesisId: "H5-H6",
  location: "scripts/pages-deploy.mjs:auth",
  message: "pages deploy auth snapshot",
  data: authSnapshot,
  timestamp: Date.now(),
};
try {
  appendFileSync(logPath, `${JSON.stringify(debugEntry)}\n`);
} catch {
  // ignore
}
console.log(
  `[pages-deploy] token=${authSnapshot.hasApiToken ? "set" : "unset"} accountId=${authSnapshot.hasAccountId ? "set" : "unset"} project=${projectName}`
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

if (process.env.CLOUDFLARE_API_TOKEN) {
  console.warn(
    "[pages-deploy] CLOUDFLARE_API_TOKEN is set. If deploy fails with auth " +
      "error 10000, remove it from Pages Variables or replace it with a token " +
      "that has Account > Cloudflare Pages > Edit and User > User Details > Read."
  );
}

const args = ["wrangler", "pages", "deploy", "--project-name", projectName];
if (process.env.CLOUDFLARE_ACCOUNT_ID) {
  args.push("--account-id", process.env.CLOUDFLARE_ACCOUNT_ID);
}

const result = spawnSync("npx", args, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
