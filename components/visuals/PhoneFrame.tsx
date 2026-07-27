import { cn } from "@/lib/cn";

/** CSS device shell — wraps any screen content. */
export function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-[290px] rounded-[44px] border border-hairline bg-white p-2.5",
        "shadow-[0_2px_4px_rgba(4,16,43,0.04),0_24px_64px_-24px_rgba(4,16,43,0.28)]",
        className
      )}
    >
      <div className="relative overflow-hidden rounded-[34px] border border-hairline/60 bg-surface">
        {/* Notch */}
        <div className="absolute left-1/2 top-2.5 z-10 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-ink" />
        {children}
      </div>
    </div>
  );
}
