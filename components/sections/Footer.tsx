import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

type FooterLink =
  | { label: string; href: string }
  | { label: string; comingSoon: true };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Download", href: "#early-access" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@svar.ai", href: "mailto:hello@svar.ai" },
      { label: "LinkedIn", comingSoon: true },
      { label: "X", href: "https://x.com/kuchtohboltarun" },
      { label: "Instagram", comingSoon: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white py-14">
      <Container>
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="SVAR AI home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-muted">
              Speak once. Use it everywhere. Voice notes that turn themselves
              into finished work.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-faint">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"comingSoon" in link ? (
                      <span className="text-[14px] text-muted">
                        {link.label}{" "}
                        <span className="text-faint">(coming soon)</span>
                      </span>
                    ) : link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-[14px] text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-[14px] text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[14px] text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-hairline pt-6">
          <p className="text-[13px] text-faint">© 2026 SVAR AI</p>
        </div>
      </Container>
    </footer>
  );
}
