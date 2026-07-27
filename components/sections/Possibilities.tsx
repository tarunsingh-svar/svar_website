import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { OutputMorph } from "@/components/visuals/OutputMorph";

export function Possibilities() {
  return (
    <section id="features" className="scroll-mt-16 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="One recording. Endless possibilities."
          title="More than just a transcript."
          lede="Instead of manually rewriting the same conversation over and over, let SVAR instantly transform it into structured outputs that are ready to use."
        />
        <Reveal className="mt-14" delay={0.1}>
          <OutputMorph />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-12 text-center font-display text-lg font-bold text-ink">
            Record once. Reuse everywhere.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
