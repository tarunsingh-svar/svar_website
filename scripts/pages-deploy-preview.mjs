/**
 * Preview deploy for non-production branches (Workers Builds).
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const branch = process.env.CF_PAGES_BRANCH;

if (!branch) {
  console.error(
    "pages-deploy-preview: CF_PAGES_BRANCH is not set for preview deploy."
  );
  process.exit(1);
}

if (!existsSync(path.join(root, "out", "index.html"))) {
  console.error(
    "[pages-deploy-preview] Missing out/index.html — run npm run pages:build first."
  );
  process.exit(1);
}

function readWorkerName() {
  const toml = readFileSync(path.join(root, "wrangler.toml"), "utf8");
  const match = toml.match(/^name\s*=\s*"([^"]+)"/m);
  return match?.[1] ?? "svar-website";
}

console.log(
  `[pages-deploy-preview] wrangler deploy (worker=${readWorkerName()}, branch=${branch})`
);

const result = spawnSync("npx", ["wrangler", "deploy", "--commit-dirty=true"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
