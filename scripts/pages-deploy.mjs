/**
 * Deploy static marketing assets to the linked Cloudflare Worker.
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readWorkerName() {
  const toml = readFileSync(path.join(root, "wrangler.toml"), "utf8");
  const match = toml.match(/^name\s*=\s*"([^"]+)"/m);
  return match?.[1] ?? "svar-website";
}

if (!existsSync(path.join(root, "out", "index.html"))) {
  console.error(
    `[pages-deploy] Missing out/index.html — run npm run pages:build first.`
  );
  process.exit(1);
}

console.log(
  `[pages-deploy] wrangler deploy (worker=${readWorkerName()}, assets=out/)`
);

const result = spawnSync("npx", ["wrangler", "deploy"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
