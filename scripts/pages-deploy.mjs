/**
 * Production Pages deploy. Output dir comes from wrangler.toml
 * (pages_build_output_dir = "./out").
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("npx", ["wrangler", "pages", "deploy"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
