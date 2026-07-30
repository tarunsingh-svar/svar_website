import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "amber" | "mint" | "violet" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface text-muted border-hairline",
  primary: "bg-blue-50 text-primary-deep border-blue-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  mint: "bg-emerald-50 text-emerald-700 border-emerald-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
  danger: "bg-red-50 text-red-600 border-red-100",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
