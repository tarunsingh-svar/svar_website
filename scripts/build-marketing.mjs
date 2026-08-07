/**
 * Builds a static export of the marketing site only (/ , /privacy , /terms).
 * App routes, auth, and API routes are stashed for the duration of the build
 * so Next.js can emit a Cloudflare Pages-compatible `out/` directory.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stashRoot = path.join(root, ".marketing-stash");

const pathsToStash = [
  "app/app",
  "app/api",
  "app/(auth)",
  "app/onboarding",
  "app/auth",
  "proxy.ts",
];

function stashNonMarketingRoutes() {
  mkdirSync(stashRoot, { recursive: true });

  for (const rel of pathsToStash) {
    const source = path.join(root, rel);
    if (!existsSync(source)) continue;

    const destination = path.join(stashRoot, rel);
    mkdirSync(path.dirname(destination), { recursive: true });
    renameSync(source, destination);
  }
}

function restoreNonMarketingRoutes() {
  if (!existsSync(stashRoot)) return;

  for (const rel of pathsToStash) {
    const source = path.join(stashRoot, rel);
    if (!existsSync(source)) continue;

    const destination = path.join(root, rel);
    mkdirSync(path.dirname(destination), { recursive: true });
    renameSync(source, destination);
  }

  rmSync(stashRoot, { recursive: true, force: true });
}

stashNonMarketingRoutes();

try {
  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, MARKETING_BUILD: "1" },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
} finally {
  restoreNonMarketingRoutes();
}
