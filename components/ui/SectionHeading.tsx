import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  dark = false,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  dark?: boolean;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        align === "left" && "text-left"
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-[13px] font-semibold uppercase tracking-[0.14em]",
            dark ? "text-blue-300" : "text-primary"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.12] tracking-tight",
          dark ? "text-white" : "text-ink"
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "mt-4 text-base sm:text-lg leading-relaxed",
            dark ? "text-blue-100/70" : "text-muted"
          )}
        >
          {lede}
        </p>
      )}
    </Reveal>
  );
}
