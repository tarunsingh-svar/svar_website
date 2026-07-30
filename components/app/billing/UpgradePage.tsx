"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useSession } from "@/components/app/SessionProvider";
import { isPro, planLabel } from "@/lib/plan";
import {
  isBillingConfigured,
  loadPlans,
  purchasePlan,
  type PurchasablePlan,
} from "@/lib/billing/revenuecat";
import { AppPageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

const PERKS = [
  "Unlimited notes — the free plan stops at 10",
  "Recordings of any length, not just 3 minutes",
  "All 16 rewrite formats, not just Meeting Notes",
  "One subscription across web, iOS and Android",
];

export function UpgradePage() {
  const router = useRouter();
  const { user, plan } = useSession();
  const [plans, setPlans] = useState<PurchasablePlan[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const alreadyPro = isPro(plan);
  const configured = isBillingConfigured();

  useEffect(() => {
    if (!configured || alreadyPro) return;
    let cancelled = false;

    loadPlans(user.id)
      .then((result) => {
        if (!cancelled) setPlans(result);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load offerings", error);
        setLoadError("Couldn't load the plans. Please try again shortly.");
      });

    return () => {
      cancelled = true;
    };
  }, [configured, alreadyPro, user.id]);

  async function buy(target: PurchasablePlan) {
    setBuyingId(target.id);
    try {
      const granted = await purchasePlan(user.id, target);
      if (granted) {
        toast.success("You're on Pro. Enjoy.");
        // The webhook writes profiles asynchronously; refresh the server
        // components so the new entitlement is picked up.
        router.refresh();
        router.push("/app");
      } else {
        toast.error("The purchase didn't complete.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The purchase failed.";
      if (!/cancel/i.test(message)) toast.error(message);
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <>
      <AppPageHeader
        title="SVAR Pro"
        description={alreadyPro ? undefined : "Everything, without the limits."}
      />

      <div className="mx-auto max-w-3xl px-5 py-10 md:px-8">
        {alreadyPro ? (
          <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50">
              <Sparkles className="size-6 text-amber-600" />
            </div>
            <p className="font-display text-xl font-bold text-ink">
              You&apos;re on {planLabel(plan)}
            </p>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
              {plan.isLifetime
                ? "You have lifetime access. Nothing to renew."
                : plan.proExpiresAt
                  ? `Your plan renews on ${new Date(plan.proExpiresAt).toLocaleDateString()}.`
                  : "Your subscription is active."}
            </p>
            <Button href="/app" variant="secondary" className="mt-6">
              Back to notes
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-start">
            <ul className="space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50"
                  >
                    <Check className="size-3 text-primary" />
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              {!configured ? (
                <BillingUnavailable />
              ) : loadError ? (
                <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {loadError}
                </p>
              ) : plans === null ? (
                <>
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </>
              ) : plans.length === 0 ? (
                <BillingUnavailable />
              ) : (
                plans.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => void buy(entry)}
                    disabled={buyingId !== null}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-2xl border bg-white p-5 text-left transition-all",
                      "border-hairline hover:border-primary hover:shadow-[0_8px_28px_-12px_rgba(37,99,235,0.4)]",
                      "disabled:pointer-events-none disabled:opacity-60"
                    )}
                  >
                    <span>
                      <span className="block font-display text-[17px] font-bold text-ink">
                        {entry.title}
                      </span>
                      <span className="block text-sm text-muted">
                        {entry.periodLabel}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-display text-lg font-bold text-ink">
                        {entry.priceLabel}
                      </span>
                      {buyingId === entry.id && (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      )}
                    </span>
                  </button>
                ))
              )}

              <p className="pt-1 text-center text-xs leading-relaxed text-faint">
                Subscriptions renew automatically. Cancel any time — your Pro
                access carries over to the iOS and Android apps.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function BillingUnavailable() {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5">
      <p className="font-display text-[15px] font-semibold text-ink">
        Checkout isn&apos;t available on the web yet
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Subscribe in the SVAR mobile app and your Pro access will appear here
        automatically.
      </p>
    </div>
  );
}
