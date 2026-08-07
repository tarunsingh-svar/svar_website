/**
 * Deploy static marketing assets to the linked Cloudflare Worker.
 * Uses `wrangler deploy` (Workers Builds), not `wrangler pages deploy`.
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "..", ".cursor", "debug-5aaf60.log");

function readWorkerName() {
  const toml = readFileSync(path.join(root, "wrangler.toml"), "utf8");
  const match = toml.match(/^name\s*=\s*"([^"]+)"/m);
  return match?.[1] ?? "svar-website";
}

const workerName = readWorkerName();

if (!existsSync(path.join(root, "out", "index.html"))) {
  console.error(
    `[pages-deploy] Missing out/index.html — run npm run pages:build first.`
  );
  process.exit(1);
}

const deploySnapshot = {
  workerName,
  hasApiToken: Boolean(process.env.CLOUDFLARE_API_TOKEN),
  ci: process.env.CI ?? null,
};

// #region agent log
const debugEntry = {
  sessionId: "5aaf60",
  runId: "worker-deploy",
  hypothesisId: "H8",
  location: "scripts/pages-deploy.mjs:deploy",
  message: "worker deploy snapshot",
  data: deploySnapshot,
  timestamp: Date.now(),
};
try {
  appendFileSync(logPath, `${JSON.stringify(debugEntry)}\n`);
} catch {
  // ignore
}
console.log(
  `[pages-deploy] wrangler deploy (worker=${workerName}, assets=out/)`
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

const result = spawnSync("npx", ["wrangler", "deploy"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
