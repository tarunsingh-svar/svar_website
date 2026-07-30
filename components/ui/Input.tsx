import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-hairline bg-white px-4 text-[15px] text-ink",
        "placeholder:text-faint",
        "transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
        "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full resize-y rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] leading-relaxed text-ink",
        "placeholder:text-faint",
        "transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
        "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "block text-sm font-semibold font-display text-ink",
        className
      )}
      {...props}
    />
  );
}
