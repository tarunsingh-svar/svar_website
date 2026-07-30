import type { Entitlement, Plan, ProfileRow } from "@/lib/supabase/types";

/**
 * Free-tier limits. Mirrors svar_ai/lib/core/constants/plan_limits.dart —
 * keep the two in sync or a user will see different caps per platform.
 */
export const FREE_NOTE_LIMIT = 10;
export const FREE_MAX_RECORDING_SECONDS = 180;
export const FREE_REWRITE_IDS = new Set<string>(["meeting_notes"]);

export interface PlanState {
  entitlement: Entitlement;
  plan: Plan | null;
  isLifetime: boolean;
  proExpiresAt: string | null;
  notesCreatedCount: number;
}

export const FREE_PLAN_STATE: PlanState = {
  entitlement: "free",
  plan: null,
  isLifetime: false,
  proExpiresAt: null,
  notesCreatedCount: 0,
};

export function planStateFromProfile(profile: ProfileRow | null): PlanState {
  if (!profile) return FREE_PLAN_STATE;
  return {
    entitlement: profile.entitlement,
    plan: profile.plan,
    isLifetime: profile.is_lifetime,
    proExpiresAt: profile.pro_expires_at,
    notesCreatedCount: profile.notes_created_count,
  };
}

export function isPro(state: PlanState): boolean {
  if (state.entitlement !== "pro") return false;
  if (state.isLifetime) return true;
  if (!state.proExpiresAt) return true;
  return new Date(state.proExpiresAt).getTime() > Date.now();
}

export function canCreateNote(state: PlanState): boolean {
  return isPro(state) || state.notesCreatedCount < FREE_NOTE_LIMIT;
}

export function notesRemaining(state: PlanState): number {
  if (isPro(state)) return Number.POSITIVE_INFINITY;
  return Math.max(0, FREE_NOTE_LIMIT - state.notesCreatedCount);
}

export function maxRecordingSeconds(state: PlanState): number {
  return isPro(state)
    ? Number.POSITIVE_INFINITY
    : FREE_MAX_RECORDING_SECONDS;
}

export function isRewriteAllowed(state: PlanState, rewriteId: string): boolean {
  return isPro(state) || FREE_REWRITE_IDS.has(rewriteId);
}

export function planLabel(state: PlanState): string {
  if (!isPro(state)) return "Free";
  if (state.isLifetime) return "Pro · Lifetime";
  if (state.plan === "yearly") return "Pro · Yearly";
  if (state.plan === "monthly") return "Pro · Monthly";
  return "Pro";
}
