import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Request-scoped client for Server Components, Server Actions and Route
 * Handlers. Queries run as the signed-in user, so RLS is the access boundary.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot set cookies. The middleware refreshes
            // the session, so this is safe to swallow.
          }
        },
      },
    }
  );
}

/**
 * Service-role client. Bypasses RLS entirely — only use for operations that
 * genuinely need to act outside a user's permissions, and never pass
 * user-supplied filters to it without checking ownership first.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
