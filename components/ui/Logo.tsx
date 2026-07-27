import { cn } from "@/lib/cn";

/** Coded wordmark: waveform glyph + SVAR. */
export function Logo({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="6" width="2" height="4" rx="1" fill="white" />
          <rect x="4.5" y="3.5" width="2" height="9" rx="1" fill="white" />
          <rect x="8" y="1" width="2" height="14" rx="1" fill="white" />
          <rect x="11.5" y="4.5" width="2" height="7" rx="1" fill="white" />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          dark ? "text-white" : "text-ink"
        )}
      >
        SVAR{" "}
        <span className={dark ? "text-blue-300" : "text-primary"}>AI</span>
      </span>
    </span>
  );
}
