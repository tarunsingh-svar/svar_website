"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { EmailCapture } from "@/components/EmailCapture";
import { Waveform } from "@/components/visuals/Waveform";

const MANIFESTO =
  "Great ideas rarely arrive when you're ready. They show up mid-conversation, on your morning walk, halfway through a meeting, late at night. SVAR makes sure those moments don't disappear — just speak, and we'll handle everything that comes after.";

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

/** Word-by-word reveal driven by scroll position through the paragraph. */
function ProgressiveText() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = MANIFESTO.split(" ");

  return (
    <p
      ref={ref}
      className="mx-auto max-w-3xl text-center font-display text-3xl font-bold leading-[1.3] tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.28]"
    >
      {reduceMotion
        ? MANIFESTO
        : words.map((word, i) => (
            <Word
              key={i}
              word={word}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
            />
          ))}
    </p>
  );
}

export function IdeasCta() {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Night sky drifts as the panel crosses the viewport.
  const { scrollYProgress: panelProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  });
  const nightY = useTransform(panelProgress, [0, 1], ["-7%", "7%"]);

  return (
    <section id="early-access" className="scroll-mt-16 py-24 sm:py-32">
      <Container>
        <ProgressiveText />

        {/* Early access panel */}
        <Reveal className="mt-20 sm:mt-28">
          <div
            ref={panelRef}
            className="relative overflow-hidden rounded-[2.5rem] bg-navy px-6 py-16 sm:px-12 sm:py-20"
          >
            {/* Painterly night scene — parallax layer */}
            <motion.div
              aria-hidden
              style={
                reduceMotion
                  ? { backgroundImage: "url(/cta-night.jpg)" }
                  : { backgroundImage: "url(/cta-night.jpg)", y: nightY }
              }
              className="absolute inset-x-0 -bottom-[10%] -top-[10%] bg-cover bg-center"
            />
            {/* Keep the copy readable over the stars */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_40%,rgba(4,16,43,0.55),rgba(4,16,43,0.15)_60%,transparent_85%)]"
            />
            <div className="relative mx-auto max-w-2xl text-center">
              <div className="mb-8 flex justify-center opacity-60">
                <Waveform bars={20} height={32} color="#ffffff" />
              </div>
              <h2 className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
                Stop taking notes.
                <br />
                Start capturing ideas.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-blue-100/80">
                Whether it&apos;s your next meeting, your next lecture or your
                next breakthrough idea — SVAR is ready when you are.
              </p>
              <div className="mt-9 flex justify-center">
                <EmailCapture
                  source="final-cta"
                  dark
                  className="w-full max-w-md"
                />
              </div>
              <p
                id="download"
                className="mt-8 scroll-mt-24 text-[14px] text-blue-100/70"
              >
                iOS &amp; Android apps and the web dashboard open to early
                access members first.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
