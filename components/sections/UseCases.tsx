"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { accentSoftBg, accentText, useCases } from "@/lib/content";

export function UseCases() {
  const [active, setActive] = useState(0);
  const [userDriven, setUserDriven] = useState(false);
  const reduceMotion = useReducedMotion();
  const uc = useCases[active];

  useEffect(() => {
    if (userDriven || reduceMotion) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % useCases.length),
      3000
    );
    return () => clearInterval(id);
  }, [userDriven, reduceMotion]);

  return (
    <section id="use-cases" className="scroll-mt-16 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Built for every kind of conversation"
          title="Whatever you're working on, SVAR fits right in."
        />

        <Reveal className="mt-12" delay={0.1}>
          <div
            role="tablist"
            aria-label="Use cases"
            className="flex flex-wrap justify-center gap-2"
          >
            {useCases.map((u, i) => (
              <button
                key={u.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => {
                  setActive(i);
                  setUserDriven(true);
                }}
                className={cn(
                  "rounded-full border px-5 py-2.5 font-display text-[14px] font-semibold transition-all",
                  i === active
                    ? "border-ink bg-ink text-white"
                    : "border-hairline bg-white text-muted hover:border-faint hover:text-ink"
                )}
              >
                <span className="mr-1.5" aria-hidden>
                  {u.emojiLabel}
                </span>
                {u.tab}
              </button>
            ))}
          </div>

          <div className="mt-8 min-h-[320px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={uc.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid gap-8 rounded-3xl border border-hairline bg-surface p-8 sm:p-10 lg:grid-cols-2"
              >
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                    {uc.headline}
                  </h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                    {uc.body}
                  </p>
                  <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.12em] text-faint">
                    Perfect for
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {uc.perfectFor.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-hairline bg-white px-3.5 py-1.5 text-[13px] font-medium text-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-faint">
                    Your recording becomes
                  </p>
                  <div className="mt-3 space-y-2">
                    {uc.outputs.map((output, i) => (
                      <div
                        key={output}
                        className="flex items-center gap-3 rounded-xl border border-hairline bg-white p-3.5"
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg font-display text-[13px] font-bold",
                            accentSoftBg[uc.accent],
                            accentText[uc.accent]
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[14px] font-semibold text-ink">
                          {output}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
