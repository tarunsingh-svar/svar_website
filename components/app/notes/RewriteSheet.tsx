"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { REWRITE_GROUPS, type RewriteOption } from "@/lib/rewrites";
import { isRewriteAllowed } from "@/lib/plan";
import { useSession } from "@/components/app/SessionProvider";
import { usePaywall } from "@/lib/stores/paywall";
import { useUpdateNote, type Note } from "@/lib/queries/notes";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";

export function RewriteSheet({
  note,
  open,
  onOpenChange,
  onApplied,
}: {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied: (result: string) => void;
}) {
  const { plan } = useSession();
  const showPaywall = usePaywall((state) => state.showPaywall);
  const updateNote = useUpdateNote();
  const [runningId, setRunningId] = useState<string | null>(null);

  // Rewrites read the transcript for recordings and the written body for
  // manual notes, matching how the mobile app sources its input.
  const source =
    note.transcribe_text?.trim() || note.summary_text?.trim() || "";

  async function run(option: RewriteOption) {
    if (!isRewriteAllowed(plan, option.id)) {
      onOpenChange(false);
      showPaywall(
        `${option.title} is a Pro feature. Upgrade to unlock all rewrite options.`
      );
      return;
    }

    if (!source) {
      toast.error("This note has no content to rewrite yet.");
      return;
    }

    setRunningId(option.id);
    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewriteId: option.id, text: source }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "The rewrite failed.");
      }

      const result: string = payload.result;
      await updateNote.mutateAsync({
        id: note.id,
        patch: { summary_text: result },
      });
      onApplied(result);
      onOpenChange(false);
      toast.success(`${option.title} ready`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The rewrite failed."
      );
    } finally {
      setRunningId(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Rewrite</SheetTitle>
          <SheetDescription>
            Turn this note into another format. The result replaces what&apos;s
            in the Notes tab — your transcript stays untouched.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {REWRITE_GROUPS.map((group) => (
            <section key={group.label} className="mb-6 last:mb-0">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-faint">
                {group.label}
              </h3>
              <div className="divide-y divide-hairline">
                {group.options.map((option) => {
                  const allowed = isRewriteAllowed(plan, option.id);
                  const running = runningId === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => void run(option)}
                      disabled={runningId !== null}
                      className={cn(
                        "flex w-full items-center gap-3 py-3 text-left transition-opacity",
                        "disabled:cursor-not-allowed",
                        !allowed && "opacity-60",
                        runningId !== null && !running && "opacity-40"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-ink">
                          {option.title}
                        </span>
                        <span className="block text-sm leading-snug text-muted">
                          {option.description}
                        </span>
                      </span>
                      {running ? (
                        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                      ) : (
                        !allowed && (
                          <Lock className="size-4 shrink-0 text-faint" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
