import "server-only";

import { createClient } from "@/lib/supabase/server";
import { planStateFromProfile, type PlanState } from "@/lib/plan";
import type { User } from "@supabase/supabase-js";

export interface AuthedRequest {
  user: User;
  plan: PlanState;
  accessToken: string;
}

/**
 * Resolves the caller for API routes. Returns null when there is no valid
 * session, so handlers can respond 401 without duplicating the plumbing.
 *
 * The plan is read from `profiles`, which clients cannot write, so it is safe
 * to gate paid features on.
 */
export async function requireUser(): Promise<AuthedRequest | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    plan: planStateFromProfile(profile),
    accessToken: session.access_token,
  };
}
