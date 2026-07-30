"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { usePaywall } from "@/lib/stores/paywall";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

const PERKS = [
  "Unlimited notes",
  "Recordings of any length",
  "Every rewrite format",
  "Works across web, iOS and Android",
];

export function PaywallDialog() {
  const router = useRouter();
  const { open, reason, close } = usePaywall();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-50">
            <Sparkles className="size-6 text-amber-600" />
          </div>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            {reason ?? "Unlock everything SVAR can do."}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {PERKS.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2.5 text-[15px] text-ink"
            >
              <span
                aria-hidden
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-primary"
              >
                ✓
              </span>
              {perk}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="secondary" onClick={close}>
            Not now
          </Button>
          <Button
            onClick={() => {
              close();
              router.push("/app/upgrade");
            }}
          >
            See plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
