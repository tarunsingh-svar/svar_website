"use client";

import Link from "next/link";
import { Mic, PenLine } from "lucide-react";
import { isManualNote, type Note } from "@/lib/queries/notes";
import { formatDuration, formatNoteDate, notePreview } from "@/lib/format";

export function NoteCard({ note }: { note: Note }) {
  const manual = isManualNote(note);

  return (
    <Link
      href={`/app/notes/${note.id}`}
      className="group flex flex-col rounded-2xl border border-hairline bg-white p-4 transition-all hover:border-primary/30 hover:shadow-[0_8px_28px_-12px_rgba(4,16,43,0.18)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-ink group-hover:text-primary-deep">
          {note.title?.trim() || "Untitled Note"}
        </h2>
        <span className="mt-0.5 shrink-0 text-faint">
          {manual ? (
            <PenLine className="size-4" />
          ) : (
            <Mic className="size-4" />
          )}
        </span>
      </div>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
        {notePreview(note.summary_text, note.transcribe_text)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {(note.tags ?? []).slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted"
          >
            {tag}
          </span>
        ))}
        {(note.tags?.length ?? 0) > 3 && (
          <span className="text-xs text-faint">
            +{(note.tags?.length ?? 0) - 3}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3 text-xs text-faint">
        <span>{formatNoteDate(note.created_at)}</span>
        {!manual && (
          <>
            <span aria-hidden>·</span>
            <span>{formatDuration(note.duration_seconds)}</span>
          </>
        )}
      </div>
    </Link>
  );
}
