import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/sections/Footer";
import type { LegalSection } from "@/lib/legal";
import { lastUpdated } from "@/lib/legal";

export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: LegalSection[];
}) {
  return (
    <main>
      <header className="border-b border-hairline">
        <Container className="flex h-16 items-center">
          <Link href="/" aria-label="SVAR AI home">
            <Logo />
          </Link>
        </Container>
      </header>
      <Container className="max-w-3xl py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-faint">Last updated: {lastUpdated}</p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-bold text-ink">
                {section.title}
              </h2>
              {section.body.split("\n\n").map((para, i) => (
                <p key={i} className="mt-3 leading-relaxed text-muted">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Container>
      <Footer />
    </main>
  );
}
