import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Waveform } from "@/components/visuals/Waveform";
import { OrganizeBoard } from "@/components/visuals/OrganizeBoard";
import { rewriteFormats } from "@/lib/content";

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-3xl border border-hairline bg-white p-6 sm:p-7 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function CardTitle({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

const allFormats = rewriteFormats.flatMap((c) => c.formats);

export function InsideSvar() {
  return (
    <section className="border-y border-hairline bg-surface py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Inside SVAR"
          title="Designed around the way you work."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {/* Record anywhere */}
          <Reveal className="md:col-span-3">
            <Card>
              <CardTitle
                title="Record anywhere"
                body="Walking, driving, in a meeting or in class — your thoughts are never more than a tap away. Records offline and in the background on Android, and transcribes the moment you're back online."
              />
              <div className="mt-auto flex items-center justify-center rounded-2xl bg-[#e9f0ff] py-8">
                <Waveform bars={30} height={44} />
              </div>
            </Card>
          </Reveal>

          {/* Understand */}
          <Reveal className="md:col-span-3" delay={0.08}>
            <Card>
              <CardTitle
                title="Understands how people actually talk"
                body="100+ languages, mixed-language conversations and speaker-separated transcripts — accurate even when the discussion jumps between English and Hindi mid-sentence."
              />
              <div className="mt-auto space-y-2 rounded-2xl bg-surface p-4">
                <p className="text-[13px] leading-snug text-muted">
                  <span className="font-bold text-primary">Speaker 1:</span>{" "}
                  Launch is set for March fourteen, theek hai?
                </p>
                <p className="text-[13px] leading-snug text-muted">
                  <span className="font-bold text-violet">Speaker 2:</span>{" "}
                  Haan, done — I&apos;ll send the plan tonight.
                </p>
              </div>
            </Card>
          </Reveal>

          {/* Organized */}
          <Reveal className="md:col-span-2" delay={0.05}>
            <Card>
              <CardTitle
                title="Everything stays organized"
                body="Tags, instant transcript search, and notes that sync across devices. Continue any recording where you left off."
              />
              <OrganizeBoard className="mt-auto" />
            </Card>
          </Reveal>

          {/* 16 formats */}
          <Reveal className="md:col-span-2" delay={0.1}>
            <Card>
              <CardTitle
                title="16+ rewrite formats"
                body="One recording, any shape you need — or describe your own custom format."
              />
              <div className="mt-auto flex flex-wrap gap-1.5">
                {allFormats.map((format) => (
                  <span
                    key={format}
                    className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </Card>
          </Reveal>

          {/* Share */}
          <Reveal className="md:col-span-2" delay={0.15}>
            <Card>
              <CardTitle
                title="Share anywhere"
                body="Copy with one click, export formatted PDFs, or send your output to any app on your phone. Access everything from web or mobile."
              />
              <div className="mt-auto grid grid-cols-2 gap-2">
                {["One-click copy", "PDF export", "Email", "Any app"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-hairline bg-surface px-3 py-2.5 text-center text-[12.5px] font-semibold text-muted"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </Card>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
