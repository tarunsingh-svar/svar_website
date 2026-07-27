"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { outputSamples } from "@/lib/content";
import { OutputDoc } from "./OutputDoc";
import { Waveform } from "./Waveform";

/**
 * Signature interaction: one recording on the left, a chip row on the
 * right that cross-fades the panel into the selected output format.
 * Auto-advances until the user picks a chip themselves.
 */
export function OutputMorph() {
  const [active, setActive] = useState(0);
  const [userDriven, setUserDriven] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userDriven || reduceMotion) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % outputSamples.length),
      3800
    );
    return () => clearInterval(id);
  }, [userDriven, reduceMotion]);

  const sample = outputSamples[active];

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[5fr_7fr] lg:gap-14">
      {/* Source recording */}
      <div className="relative mx-auto w-full max-w-sm">
        <div className="rounded-3xl border border-hairline bg-white p-6 shadow-[0_20px_60px_-30px_rgba(4,16,43,0.25)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-[15px] font-bold text-ink">
                Onboarding Revamp — Kickoff
              </p>
              <p className="text-xs text-faint">Today · 24:08</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#e63946]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e63946]" />
              REC
            </span>
          </div>
          <div className="flex justify-center rounded-2xl bg-[#e9f0ff] px-4 py-6">
            <Waveform bars={26} height={44} />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["#product", "#kickoff", "#q1"].map((tag, i) => (
              <span
                key={tag}
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                  i === 0 && "bg-amber-50 text-amber",
                  i === 1 && "bg-emerald-50 text-mint",
                  i === 2 && "bg-purple-50 text-violet"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Connector — desktop only */}
        <div
          aria-hidden
          className="absolute -right-14 top-1/2 hidden w-14 -translate-y-1/2 lg:block"
        >
          <svg width="56" height="24" viewBox="0 0 56 24" fill="none">
            <path
              d="M0 12 H44 M44 12 L36 5 M44 12 L36 19"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Output side */}
      <div>
        <div
          role="tablist"
          aria-label="Output formats"
          className="mb-5 flex flex-wrap gap-2"
        >
          {outputSamples.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setActive(i);
                setUserDriven(true);
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-all duration-200",
                i === active
                  ? "border-primary bg-primary text-white"
                  : "border-hairline bg-white text-muted hover:border-faint hover:text-ink"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div ref={panelRef} className="min-h-[340px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sample.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <OutputDoc
                sample={sample}
                className="shadow-[0_20px_60px_-30px_rgba(4,16,43,0.25)]"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
