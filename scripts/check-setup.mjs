#!/usr/bin/env node
/**
 * Validates local env before running the web app.
 * Usage: node scripts/check-setup.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

function loadEnv(file) {
  const vars = {};
  if (!existsSync(file)) return vars;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq)] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const env = loadEnv(envPath);
let ok = true;

if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy .env.example and fill in the values.");
  ok = false;
}

for (const key of required) {
  if (!env[key]) {
    console.error(`Missing ${key} in .env.local`);
    ok = false;
  }
}

if (env.NEXT_PUBLIC_SITE_URL && !env.NEXT_PUBLIC_SITE_URL.startsWith("http")) {
  console.error("NEXT_PUBLIC_SITE_URL must include http:// or https://");
  ok = false;
}

const optional = ["NEXT_PUBLIC_REVENUECAT_WEB_API_KEY", "AI_API_URL"];
for (const key of optional) {
  if (!env[key]) {
    console.warn(`Optional: ${key} is not set`);
  }
}

if (ok) {
  console.log("Env looks good. Start the app with: npm run dev");
  console.log("");
  console.log("Supabase redirect URLs (Dashboard > Auth > URL Configuration):");
  console.log(`  Site URL: ${env.NEXT_PUBLIC_SITE_URL}`);
  console.log(`  Redirect: ${env.NEXT_PUBLIC_SITE_URL}/auth/callback`);
  process.exit(0);
}

process.exit(1);
