"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { EmailCapture } from "@/components/EmailCapture";
import { PhoneFrame } from "@/components/visuals/PhoneFrame";
import { Waveform } from "@/components/visuals/Waveform";
import { TranscriptStream } from "@/components/visuals/TranscriptStream";
import { OutputDoc } from "@/components/visuals/OutputDoc";
import { outputSamples } from "@/lib/content";

const pills = [
  "🌍 100+ Languages",
  "📱 Mobile & Web",
  "🎙️ Record Offline",
  "✨ 16+ AI Rewrite Formats",
];

// Alternate textured oil-paint scene available at "/hero-scene-alt.jpg".
const HERO_IMAGE = "/hero-scene.jpg";

// Floating meadow particles: [left%, top%, size(px), delay(s), duration(s)]
const particles: [number, number, number, number, number][] = [
  [12, 68, 5, 0, 4.5],
  [22, 78, 4, 1.1, 6],
  [35, 84, 6, 2.0, 4],
  [55, 80, 4, 0.7, 5.5],
  [68, 72, 5, 1.6, 5],
  [82, 76, 4, 2.5, 6.5],
  [90, 66, 5, 1.4, 4],
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll parallax: background sinks slowly, phone rises slightly faster
  // than the page — three depth planes.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  const float = (delay: number) =>
    reduceMotion
      ? {}
      : {
          animate: { y: [0, -8, 0] },
          transition: {
            duration: 5,
            delay,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pb-20 pt-32 sm:pt-40"
    >
      {/* Drifting painterly scene */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <motion.div
          style={reduceMotion ? undefined : { y: bgY }}
          className="absolute inset-x-0 -bottom-[14%] -top-[14%]"
        >
          <div
            className="absolute inset-0 animate-sky-drift bg-cover bg-[position:center_35%] will-change-transform motion-reduce:animate-none"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
        </motion.div>

        {/* Drifting cloud puffs — two planes, different speeds */}
        <div className="absolute left-0 top-[6%] h-40 w-[38rem] animate-cloud-slow rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55),transparent_65%)] blur-2xl motion-reduce:hidden" />
        <div
          className="absolute left-0 top-[22%] h-32 w-[26rem] animate-cloud-fast rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.45),transparent_65%)] blur-2xl motion-reduce:hidden"
          style={{ animationDelay: "-8s" }}
        />
        <div
          className="absolute left-0 top-[40%] h-28 w-[30rem] animate-cloud-slow rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.35),transparent_65%)] blur-3xl motion-reduce:hidden"
          style={{ animationDelay: "-23s" }}
        />

        {/* Sunlight sweep */}
        <div className="absolute -inset-y-1/4 left-1/4 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent blur-3xl motion-reduce:hidden" />

        {/* Floating meadow particles */}
        {particles.map(([left, top, size, delay, duration], i) => (
          <span
            key={i}
            className="absolute animate-pollen rounded-full bg-white/90 blur-[1px] motion-reduce:hidden"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}

        {/* White veil over the copy side so headline and CTAs keep contrast */}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.78)_34%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0.05)_78%)]" />
        {/* Light strip behind the nav */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent" />
        {/* Slim blend into the white canvas below */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </div>
      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[6fr_5fr]">
          {/* Copy — gently fades as it scrolls away */}
          <motion.div
            style={reduceMotion ? undefined : { opacity: copyOpacity }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-1.5 text-[13px] font-semibold text-muted">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                Now accepting early access members
              </p>
              <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-ink sm:text-6xl">
                Speak once.
                <br />
                <span className="bg-gradient-to-r from-primary-bright to-primary-deep bg-clip-text text-transparent">
                  Use it everywhere.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted lg:mx-0">
                SVAR captures your meetings, conversations, ideas, lectures,
                and voice notes—and turns them into transcripts, summaries,
                action items, and content you can actually use.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="mt-8 flex flex-col items-center gap-4 lg:items-start"
            >
              <EmailCapture source="hero" className="w-full sm:max-w-md" />
              <a
                href="#how-it-works"
                className="text-[14px] font-semibold text-muted transition-colors hover:text-ink"
              >
                See how it works ↓
              </a>
            </motion.div>

            <motion.ul
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-9 flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              {pills.map((pill) => (
                <li
                  key={pill}
                  className="rounded-full border border-hairline bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-muted"
                >
                  {pill}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Product visual — rises slightly faster than the page */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={reduceMotion ? undefined : { y: phoneY }}
            className="relative mx-auto hidden sm:block"
          >
            <PhoneFrame>
              <div className="px-5 pb-6 pt-12">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                  Recording
                </p>
                <p className="mt-1 font-display text-[17px] font-bold text-ink">
                  Onboarding Kickoff
                </p>
                <div className="mt-4 flex justify-center rounded-2xl bg-[#e9f0ff] px-3 py-7">
                  <Waveform bars={22} height={40} />
                </div>
                <p className="mt-3 text-center font-display text-2xl font-bold tabular-nums text-ink">
                  24:08
                </p>
                <div className="mt-4 rounded-xl border border-hairline bg-white p-3">
                  <TranscriptStream />
                </div>
                <div className="mt-5 flex items-center justify-center gap-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-white">
                    <span className="flex gap-[3px]">
                      <span className="h-3 w-[3px] rounded bg-ink" />
                      <span className="h-3 w-[3px] rounded bg-ink" />
                    </span>
                  </span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e63946] shadow-[0_8px_24px_-6px_rgba(230,57,70,0.5)]">
                    <span className="h-4 w-4 rounded-[4px] bg-white" />
                  </span>
                </div>
              </div>
            </PhoneFrame>

            {/* Floating outputs */}
            <motion.div
              {...float(0.4)}
              className="absolute -left-40 top-10 hidden w-56 lg:block"
            >
              <OutputDoc
                sample={outputSamples[1]}
                className="scale-[0.82] shadow-[0_20px_50px_-20px_rgba(4,16,43,0.3)]"
              />
            </motion.div>
            <motion.div
              {...float(1.2)}
              className="absolute -right-36 bottom-8 hidden w-60 xl:block"
            >
              <OutputDoc
                sample={outputSamples[3]}
                className="scale-[0.82] shadow-[0_20px_50px_-20px_rgba(4,16,43,0.3)]"
              />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
