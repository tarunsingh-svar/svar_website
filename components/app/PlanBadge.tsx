"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useSession } from "@/components/app/SessionProvider";
import { isPro, notesRemaining, planLabel, FREE_NOTE_LIMIT } from "@/lib/plan";

export function PlanBadge() {
  const { plan } = useSession();

  if (isPro(plan)) {
    return (
      <div className="rounded-xl bg-surface px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Sparkles className="size-4 text-amber" />
          {planLabel(plan)}
        </p>
        <p className="mt-0.5 text-xs text-faint">Unlimited notes and rewrites</p>
      </div>
    );
  }

  const remaining = notesRemaining(plan);
  const used = FREE_NOTE_LIMIT - remaining;

  return (
    <Link
      href="/app/upgrade"
      className="block rounded-xl border border-hairline bg-white p-3 transition-colors hover:border-primary/40 hover:bg-blue-50/40"
    >
      <p className="flex items-center justify-between text-sm font-semibold text-ink">
        Free plan
        <span className="text-xs font-bold text-primary">Upgrade</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, (used / FREE_NOTE_LIMIT) * 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-faint">
        {remaining} of {FREE_NOTE_LIMIT} notes left
      </p>
    </Link>
  );
}
