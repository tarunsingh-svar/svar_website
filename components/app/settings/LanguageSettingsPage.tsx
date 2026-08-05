"use client";

import { useMemo, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Search } from "lucide-react";
import {
  AUTO,
  AUTO_CODE,
  GLOBAL_LANGUAGES,
  INDIAN_LANGUAGES,
  type TranscriptionLanguage,
} from "@/lib/transcription-languages";
import {
  getLanguageCode,
  setLanguageCode,
  subscribeLanguagePreference,
} from "@/lib/transcription-preferences";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

function matches(language: TranscriptionLanguage, query: string) {
  if (!query) return true;
  const needle = query.toLowerCase();
  return (
    language.name.toLowerCase().includes(needle) ||
    language.code.toLowerCase().includes(needle) ||
    (language.nativeName?.toLowerCase().includes(needle) ?? false)
  );
}

export function LanguageSettingsPage() {
  const selectedCode = useSyncExternalStore(
    subscribeLanguagePreference,
    getLanguageCode,
    () => AUTO_CODE
  );
  const [query, setQuery] = useState("");

  const showAuto = matches(AUTO, query);
  const indian = useMemo(
    () => INDIAN_LANGUAGES.filter((language) => matches(language, query)),
    [query]
  );
  const global = useMemo(
    () => GLOBAL_LANGUAGES.filter((language) => matches(language, query)),
    [query]
  );
  const hasResults = showAuto || indian.length > 0 || global.length > 0;

  function select(code: string) {
    setLanguageCode(code);
  }

  return (
    <>
      <header className="border-b border-hairline bg-white px-5 py-4 md:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/app/settings"
            className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label="Back to settings"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">
              Transcription language
            </h1>
            <p className="text-sm text-muted">
              Used for your next recording on the web.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-5 py-6 md:px-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search languages"
            className="pl-10"
          />
        </div>

        {!hasResults ? (
          <p className="py-8 text-center text-[15px] text-muted">
            No languages match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-white">
            {showAuto && (
              <>
                <LanguageRow
                  language={AUTO}
                  selected={selectedCode === AUTO_CODE}
                  onSelect={select}
                />
                <p className="px-4 py-3 text-sm leading-relaxed text-muted">
                  Picks the best engine from your recording and browser region.
                  Change it only if transcripts come back in the wrong language.
                </p>
              </>
            )}

            {indian.length > 0 && (
              <>
                <SectionLabel>Indian languages</SectionLabel>
                {indian.map((language) => (
                  <LanguageRow
                    key={language.code}
                    language={language}
                    selected={selectedCode === language.code}
                    onSelect={select}
                  />
                ))}
              </>
            )}

            {global.length > 0 && (
              <>
                <SectionLabel>Other languages</SectionLabel>
                {global.map((language) => (
                  <LanguageRow
                    key={language.code}
                    language={language}
                    selected={selectedCode === language.code}
                    onSelect={select}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wide text-faint">
      {children}
    </p>
  );
}

function LanguageRow({
  language,
  selected,
  onSelect,
}: {
  language: TranscriptionLanguage;
  selected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(language.code)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface",
        selected && "bg-blue-50/60"
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">
          {language.name}
        </span>
        {language.nativeName && language.nativeName !== language.name && (
          <span className="block text-sm text-muted">{language.nativeName}</span>
        )}
      </span>
      {selected && <Check className="size-4 shrink-0 text-primary" />}
    </button>
  );
}
