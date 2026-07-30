"use client";

import { Purchases, type Offering, type Package } from "@revenuecat/purchases-js";

/**
 * Web Billing key. Distinct from the iOS/Android SDK keys in
 * svar_ai/lib/core/config/environment.dart, but the same RevenueCat project —
 * so entitlements granted here reach the app through the existing
 * revenuecat-webhook Edge Function.
 */
const WEB_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;

export const PRO_ENTITLEMENT_ID = "pro";

export function isBillingConfigured(): boolean {
  return Boolean(WEB_API_KEY);
}

let instance: Purchases | null = null;

/**
 * The RevenueCat app user id must be the Supabase user id: the mobile app calls
 * Purchases.logIn(supabaseUserId), and the webhook writes profiles.user_id from
 * event.app_user_id. Using anything else here would create a second account.
 */
function client(supabaseUserId: string): Purchases {
  if (!WEB_API_KEY) {
    throw new Error("Web billing is not configured.");
  }
  if (!instance) {
    instance = Purchases.configure({
      apiKey: WEB_API_KEY,
      appUserId: supabaseUserId,
    });
  }
  return instance;
}

export interface PurchasablePlan {
  id: string;
  title: string;
  priceLabel: string;
  periodLabel: string;
  package: Package;
}

const PERIOD_LABELS: Record<string, string> = {
  P1M: "per month",
  P3M: "per quarter",
  P6M: "every 6 months",
  P1Y: "per year",
};

function describe(entry: Package): PurchasablePlan {
  const product = entry.webBillingProduct ?? entry.rcBillingProduct;
  const period = product.normalPeriodDuration;

  return {
    id: entry.identifier,
    title: product.title || entry.identifier,
    priceLabel: product.price?.formattedPrice ?? "",
    periodLabel: period ? (PERIOD_LABELS[period] ?? period) : "one-time",
    package: entry,
  };
}

export async function loadPlans(
  supabaseUserId: string
): Promise<PurchasablePlan[]> {
  const offerings = await client(supabaseUserId).getOfferings();
  const offering: Offering | null = offerings.current;
  if (!offering) return [];
  return offering.availablePackages.map(describe);
}

/**
 * Resolves true when the purchase grants Pro. The webhook updates `profiles`
 * asynchronously, so callers should refresh their session data afterwards
 * rather than trusting local state.
 */
export async function purchasePlan(
  supabaseUserId: string,
  plan: PurchasablePlan
): Promise<boolean> {
  const result = await client(supabaseUserId).purchase({
    rcPackage: plan.package,
  });
  return Boolean(result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
}
