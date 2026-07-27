import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Waveform } from "@/components/visuals/Waveform";

const outputChips = ["Summary", "Meeting Minutes", "Email", "LinkedIn Post", "To-do List", "Custom"];

function StepOne() {
  return (
    <div className="flex h-28 items-center justify-center rounded-2xl bg-[#e9f0ff]">
      <Waveform bars={24} height={40} />
    </div>
  );
}

function StepTwo() {
  return (
    <div className="flex h-28 flex-wrap content-center justify-center gap-1.5 rounded-2xl bg-surface px-4">
      {outputChips.map((chip, i) => (
        <span
          key={chip}
          className={
            i === 1
              ? "rounded-full bg-primary px-3 py-1 text-[12px] font-semibold text-white"
              : "rounded-full border border-hairline bg-white px-3 py-1 text-[12px] font-medium text-muted"
          }
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function StepThree() {
  return (
    <div className="flex h-28 items-center justify-center gap-3 rounded-2xl bg-surface">
      {["Copy", "PDF", "Share"].map((label) => (
        <span
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-hairline bg-white px-4 py-2.5"
        >
          <span className="h-2 w-8 rounded bg-blue-100" />
          <span className="text-[11px] font-semibold text-muted">{label}</span>
        </span>
      ))}
    </div>
  );
}

const steps = [
  {
    n: "01",
    title: "Record naturally",
    body: "Capture meetings, lectures, brainstorms or random thoughts with a single tap. No special prompts. No formatting. Just speak.",
    visual: <StepOne />,
  },
  {
    n: "02",
    title: "Choose your output",
    body: "Tell SVAR what you want to create — a summary, meeting minutes, an email, a post, or your own custom format.",
    visual: <StepTwo />,
  },
  {
    n: "03",
    title: "Edit, share & continue",
    body: "Review, make quick edits, export anywhere and share instantly. Everything stays organized and searchable for later.",
    visual: <StepThree />,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 border-y border-hairline bg-surface py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Three simple steps."
          lede="From spoken word to finished output in less time than it takes to open a blank doc."
        />
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* Connecting line */}
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-24 hidden border-t border-dashed border-hairline md:block"
          />
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.12}>
              <div className="relative h-full rounded-3xl border border-hairline bg-white p-6">
                <span className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-[13px] font-bold text-white">
                  {step.n}
                </span>
                {step.visual}
                <h3 className="mt-5 font-display text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
