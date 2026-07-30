/**
 * Environment access with fail-fast reads.
 *
 * Public values are inlined by Next at build time, so they must be referenced
 * as full `process.env.NEXT_PUBLIC_*` expressions rather than looked up
 * dynamically.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

export const publicEnv = {
  supabaseUrl: required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  ),
  supabaseAnonKey: required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ),
};

/** Server-only. Throws if referenced from a client bundle. */
export const serverEnv = {
  get serviceRoleKey() {
    return required(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY"
    );
  },
  get aiApiUrl() {
    return (
      process.env.AI_API_URL ?? "https://svar-ai-flask.onrender.com"
    ).replace(/\/$/, "");
  },
  get siteUrl() {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");
  },
};
