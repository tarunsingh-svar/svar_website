import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="glow-primary pointer-events-none absolute inset-x-0 top-0 h-80"
      />
      <header className="relative px-6 py-6">
        <Link href="/" aria-label="SVAR AI home">
          <Logo />
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-6 pb-24">
        {children}
      </main>
    </div>
  );
}
