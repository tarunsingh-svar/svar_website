"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mic, PenLine, Search, X } from "lucide-react";
import { collectTags, useNotes, type Note } from "@/lib/queries/notes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { AppPageHeader } from "@/components/app/AppShell";
import { NoteCard } from "@/components/app/notes/NoteCard";
import { CreateNoteDialog } from "@/components/app/notes/CreateNoteDialog";

function matchesQuery(note: Note, query: string): boolean {
  const haystack = [
    note.title ?? "",
    note.summary_text ?? "",
    note.transcribe_text ?? "",
    ...(note.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function NotesPage() {
  const { data: notes, isLoading, error } = useNotes();
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const tags = useMemo(() => collectTags(notes ?? []), [notes]);

  const filtered = useMemo(() => {
    if (!notes) return [];
    const needle = query.trim().toLowerCase();
    return notes.filter((note) => {
      if (needle && !matchesQuery(note, needle)) return false;
      if (activeTags.length === 0) return true;
      const noteTags = note.tags ?? [];
      return activeTags.every((tag) => noteTags.includes(tag));
    });
  }, [notes, query, activeTags]);

  const toggleTag = (tag: string) =>
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag]
    );

  const hasFilters = query.trim().length > 0 || activeTags.length > 0;

  return (
    <>
      <AppPageHeader
        title="Your notes"
        description={
          notes
            ? `${notes.length} ${notes.length === 1 ? "note" : "notes"}`
            : undefined
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCreating(true)}
            >
              <PenLine className="size-4" />
              New note
            </Button>
            <Button href="/app/record" size="sm" className="max-md:hidden">
              <Mic className="size-4" />
              Record
            </Button>
          </>
        }
      />

      <div className="px-5 py-6 md:px-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-faint" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes, transcripts and tags"
            className="pl-11"
            aria-label="Search notes"
          />
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-hairline bg-white text-muted hover:border-faint hover:text-ink"
                  )}
                >
                  {tag}
                </button>
              );
            })}
            {activeTags.length > 0 && (
              <button
                onClick={() => setActiveTags([])}
                className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"
              >
                <X className="size-3.5" />
                Clear
              </button>
            )}
          </div>
        )}

        <div className="mt-6">
          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-2xl" />
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              Couldn&apos;t load your notes. {error.message}
            </p>
          )}

          {notes && filtered.length === 0 && (
            <EmptyState
              filtered={hasFilters}
              onCreate={() => setCreating(true)}
            />
          )}

          {filtered.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateNoteDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}

function EmptyState({
  filtered,
  onCreate,
}: {
  filtered: boolean;
  onCreate: () => void;
}) {
  if (filtered) {
    return (
      <div className="rounded-2xl border border-dashed border-hairline bg-white py-16 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          No matching notes
        </p>
        <p className="mt-1 text-[15px] text-muted">
          Try a different search or clear your tag filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-white py-16 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50">
        <Mic className="size-6 text-primary" />
      </div>
      <p className="font-display text-lg font-semibold text-ink">
        Nothing here yet
      </p>
      <p className="mx-auto mt-1 max-w-sm text-[15px] leading-relaxed text-muted">
        Record a thought and SVAR will turn it into a transcript, a summary and
        whatever format you need.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/app/record"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold font-display text-white transition-colors hover:bg-primary-bright"
        >
          <Mic className="size-4" />
          Start recording
        </Link>
        <Button variant="secondary" onClick={onCreate}>
          <PenLine className="size-4" />
          Write a note
        </Button>
      </div>
    </div>
  );
}
