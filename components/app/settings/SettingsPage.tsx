"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  ChevronRight,
  FileText,
  Globe,
  LifeBuoy,
  LogOut,
  Shield,
  Smartphone,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { useSession } from "@/components/app/SessionProvider";
import { isPro, notesRemaining, planLabel, FREE_NOTE_LIMIT } from "@/lib/plan";
import { SUPPORT_EMAIL, PLAY_STORE_URL } from "@/lib/support";
import { getLanguage, subscribeLanguagePreference } from "@/lib/transcription-preferences";
import { AppPageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";

export function SettingsPage() {
  const { user, plan } = useSession();
  const pro = isPro(plan);
  const languageName = useSyncExternalStore(
    subscribeLanguagePreference,
    () => getLanguage().name,
    () => "Auto-detect"
  );

  return (
    <>
      <AppPageHeader title="Settings" />

      <div className="mx-auto max-w-2xl space-y-6 px-5 py-8 md:px-8">
        <section className="rounded-2xl border border-hairline bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-display text-[17px] font-bold text-ink">
                {pro && <Sparkles className="size-4 text-amber" />}
                {planLabel(plan)}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {pro
                  ? "Unlimited notes, recordings and rewrites."
                  : `${notesRemaining(plan)} of ${FREE_NOTE_LIMIT} notes left on the free plan.`}
              </p>
            </div>
            {!pro && (
              <Button href="/app/upgrade" size="sm">
                Upgrade
              </Button>
            )}
          </div>
        </section>

        <Section title="Account">
          <Row
            href="/app/settings/profile"
            icon={UserIcon}
            label="Your profile"
            detail={user.name || user.email}
          />
        </Section>

        <Section title="Recording">
          <Row
            href="/app/settings/language"
            icon={Globe}
            label="Transcription language"
            detail={languageName}
          />
        </Section>

        <Section title="Support">
          <Row
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("SVAR AI support")}&body=${encodeURIComponent(`\n\n---\nUser ID: ${user.id}`)}`}
            icon={LifeBuoy}
            label="Help & feedback"
            detail={SUPPORT_EMAIL}
            external
          />
          <Row
            href={PLAY_STORE_URL}
            icon={Smartphone}
            label="Get the mobile app"
            detail="Record on the go"
            external
          />
        </Section>

        <Section title="Legal">
          <Row href="/privacy" icon={Shield} label="Privacy policy" />
          <Row href="/terms" icon={FileText} label="Terms of service" />
        </Section>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3.5 text-left text-[15px] font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="size-[18px]" />
            Sign out
          </button>
        </form>

        <p className="pb-4 text-center text-xs text-faint">
          Signed in as {user.email}
        </p>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-faint">
        {title}
      </h2>
      <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-white">
        {children}
      </div>
    </section>
  );
}

function Row({
  href,
  icon: Icon,
  label,
  detail,
  external = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <Icon className="size-[18px] shrink-0 text-faint" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        {detail && (
          <span className="block truncate text-sm text-muted">{detail}</span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0 text-faint" />
    </>
  );

  const className =
    "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
