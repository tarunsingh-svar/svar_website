import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { roadmap } from "@/lib/content";

const capabilities = [
  "One-Tap Recording",
  "Background Recording",
  "Continue Recording",
  "Offline Recording",
  "AI Transcription",
  "100+ Languages",
  "Mixed-Language Support",
  "Speaker-Separated Transcripts",
  "Smart Summaries",
  "Action Item Detection",
  "16+ Rewrite Formats",
  "Custom AI Formats",
  "Smart Tags",
  "Powerful Search",
  "Recording History",
  "Web Dashboard",
  "PDF Export",
  "One-Click Copy",
  "Cross-Device Sync",
];

export function Capabilities() {
  return (
    <section className="overflow-hidden py-14" aria-label="Everything built in">
      <p className="mb-8 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
        Everything you need. Nothing you don&apos;t.
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee gap-3">
          {[...capabilities, ...capabilities].map((cap, i) => (
            <span
              key={`${cap}-${i}`}
              className="whitespace-nowrap rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-medium text-muted"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <Container className="mt-16">
        <Reveal>
          <p className="mb-6 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-faint">
            On the roadmap
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-dashed border-hairline bg-surface/60 p-5"
              >
                <span className="mb-3 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                  Coming soon
                </span>
                <p className="font-display text-[15px] font-bold text-ink">
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
