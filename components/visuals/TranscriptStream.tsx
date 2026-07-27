"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const WORDS =
  "So the plan is we ship the new three step onboarding by March fourteenth and Meera takes the welcome screen redesign...".split(
    " "
  );

/** Words streaming in like a live transcript, looping. */
export function TranscriptStream({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(reduceMotion ? WORDS.length : 0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setCount((c) => (c >= WORDS.length ? 0 : c + 1));
    }, 240);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <p
      className={cn(
        "text-[13px] leading-relaxed text-muted min-h-[5.5rem]",
        className
      )}
      aria-hidden
    >
      {WORDS.slice(0, count).join(" ")}
      {!reduceMotion && count < WORDS.length && (
        <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-primary" />
      )}
    </p>
  );
}
