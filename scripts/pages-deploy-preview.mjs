/**
 * Preview / non-production Pages deploy. Cloudflare sets CF_PAGES_BRANCH
 * during builds for non-production branches.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const branch = process.env.CF_PAGES_BRANCH;

if (!branch) {
  console.error(
    "pages-deploy-preview: CF_PAGES_BRANCH is not set. " +
      "This script is for non-production branch deploys on Cloudflare Pages."
  );
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["wrangler", "pages", "deploy", "--branch", branch],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  }
);

process.exit(result.status ?? 1);
