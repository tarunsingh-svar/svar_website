import { cn } from "@/lib/cn";
import {
  accentBg,
  accentText,
  type OutputSample,
} from "@/lib/content";

/** Renders one formatted output as a small document card. */
export function OutputDoc({
  sample,
  className,
}: {
  sample: OutputSample;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline bg-white p-5 text-left",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", accentBg[sample.accent])} />
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.12em]",
            accentText[sample.accent]
          )}
        >
          {sample.label}
        </span>
      </div>
      <p className="mb-2.5 font-display text-[15px] font-bold text-ink">
        {sample.docTitle}
      </p>
      <div className="space-y-1.5">
        {sample.lines.map((line, i) => {
          if (line.type === "heading") {
            return (
              <p
                key={i}
                className="pt-1.5 text-[11px] font-bold uppercase tracking-wide text-faint"
              >
                {line.text}
              </p>
            );
          }
          if (line.type === "bullet") {
            return (
              <p key={i} className="flex gap-2 text-[13px] leading-snug text-muted">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-faint" />
                {line.text}
              </p>
            );
          }
          if (line.type === "check") {
            return (
              <p key={i} className="flex items-start gap-2 text-[13px] leading-snug text-muted">
                <span
                  className={cn(
                    "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border",
                    line.done
                      ? "border-mint bg-mint text-white"
                      : "border-hairline bg-white"
                  )}
                >
                  {line.done && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1.5 4L3.2 5.7L6.5 2.3"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                <span className={line.done ? "line-through opacity-60" : ""}>
                  {line.text}
                </span>
              </p>
            );
          }
          return (
            <p key={i} className="text-[13px] leading-snug text-muted">
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
