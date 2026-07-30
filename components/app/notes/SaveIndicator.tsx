"use client";

import { Check, CloudOff, Loader2 } from "lucide-react";
import type { SaveStatus } from "@/lib/hooks/useDebouncedSave";

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const content = {
    pending: (
      <>
        <Loader2 className="size-3.5 animate-spin" />
        Saving
      </>
    ),
    saved: (
      <>
        <Check className="size-3.5" />
        Saved
      </>
    ),
    error: (
      <>
        <CloudOff className="size-3.5" />
        Not saved
      </>
    ),
  }[status];

  return (
    <span
      role="status"
      className={`hidden items-center gap-1.5 text-xs font-medium sm:inline-flex ${
        status === "error" ? "text-red-600" : "text-faint"
      }`}
    >
      {content}
    </span>
  );
}
