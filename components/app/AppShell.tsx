"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Mic, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/app/UserMenu";
import { PlanBadge } from "@/components/app/PlanBadge";
import { PaywallDialog } from "@/components/app/PaywallDialog";

const NAV = [
  { href: "/app", label: "Notes", icon: FileText, exact: true },
  { href: "/app/record", label: "Record", icon: Mic },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex min-h-dvh flex-col bg-surface md:flex-row">
      <aside className="sticky top-0 z-30 hidden w-60 shrink-0 flex-col border-r border-hairline bg-white md:flex md:h-dvh">
        <div className="px-5 py-6">
          <Link href="/app" aria-label="SVAR AI">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold font-display transition-colors",
                isActive(href, exact)
                  ? "bg-blue-50 text-primary-deep"
                  : "text-muted hover:bg-surface hover:text-ink"
              )}
            >
              <Icon className="size-[18px]" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-hairline p-3">
          <PlanBadge />
          <UserMenu />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/app" aria-label="SVAR AI">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Button href="/app/record" size="sm" className="gap-1.5">
            <Mic className="size-4" />
            Record
          </Button>
          <UserMenu compact />
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-hairline bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors",
              isActive(href, exact) ? "text-primary" : "text-faint"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>

      <PaywallDialog />
    </div>
  );
}

export function AppPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline bg-white px-5 py-6 md:px-8">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[15px] text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ProChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
      <Sparkles className="size-3" />
      Pro
    </span>
  );
}
