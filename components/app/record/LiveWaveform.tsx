"use client";

import { cn } from "@/lib/cn";

export function LiveWaveform({
  levels,
  active,
  className,
}: {
  levels: number[];
  active: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("flex h-24 items-center justify-center gap-[3px]", className)}
      aria-hidden
    >
      {levels.map((level, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full transition-[height,background-color] duration-75",
            active ? "bg-primary" : "bg-hairline"
          )}
          style={{ height: `${Math.max(4, level * 96)}px` }}
        />
      ))}
    </div>
  );
}
