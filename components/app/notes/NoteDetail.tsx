"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, Sparkles, Tag } from "lucide-react";
import {
  collectTags,
  isManualNote,
  useNote,
  useNotes,
  useUpdateNote,
} from "@/lib/queries/notes";
import { formatDuration, formatFullDate } from "@/lib/format";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Markdown } from "@/components/app/Markdown";
import { TagInput } from "@/components/app/notes/TagInput";
import { NoteActions } from "@/components/app/notes/NoteActions";
import { RewriteSheet } from "@/components/app/notes/RewriteSheet";
import { AudioPlayer } from "@/components/app/notes/AudioPlayer";
import { SaveIndicator } from "@/components/app/notes/SaveIndicator";
import { Textarea } from "@/components/ui/Input";

export function NoteDetail({ noteId }: { noteId: number }) {
  const { data: note, isLoading, error } = useNote(noteId);
  const { data: allNotes } = useNotes();
  const updateNote = useUpdateNote();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [rewriteOpen, setRewriteOpen] = useState(false);

  // Seed the drafts from whichever note is loaded, keyed on id so later
  // refetches of the same note don't clobber an edit in progress.
  const [seededId, setSeededId] = useState<number | null>(null);
  if (note && note.id !== seededId) {
    setSeededId(note.id);
    setTitle(note.title ?? "");
    setBody(note.summary_text ?? "");
  }

  const titleSave = useDebouncedSave<string>(async (value) => {
    await updateNote.mutateAsync({ id: noteId, patch: { title: value } });
  });

  const bodySave = useDebouncedSave<string>(async (value) => {
    await updateNote.mutateAsync({ id: noteId, patch: { summary_text: value } });
  });

  if (isLoading && !note) return <NoteDetailSkeleton />;

  if (error || !note) {
    return (
      <div className="px-5 py-16 text-center md:px-8">
        <p className="font-display text-lg font-semibold text-ink">
          Note not found
        </p>
        <p className="mt-1 text-[15px] text-muted">
          It may have been deleted, or it belongs to another account.
        </p>
        <Button href="/app" variant="secondary" className="mt-6">
          Back to notes
        </Button>
      </div>
    );
  }

  const manual = isManualNote(note);
  const hasTranscript = !manual && Boolean(note.transcribe_text?.trim());
  const suggestions = collectTags(allNotes ?? []);

  return (
    <>
      <div className="border-b border-hairline bg-white">
        <div className="flex items-center justify-between gap-3 px-5 pt-5 md:px-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Notes
          </Link>
          <div className="flex items-center gap-2">
            <SaveIndicator
              status={
                titleSave.status === "pending" || bodySave.status === "pending"
                  ? "pending"
                  : titleSave.status === "error" || bodySave.status === "error"
                    ? "error"
                    : titleSave.status === "saved" || bodySave.status === "saved"
                      ? "saved"
                      : "idle"
              }
            />
            <Button size="sm" onClick={() => setRewriteOpen(true)}>
              <Sparkles className="size-4" />
              Rewrite
            </Button>
            <NoteActions note={note} />
          </div>
        </div>

        <div className="px-5 pb-5 pt-4 md:px-8">
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              titleSave.schedule(event.target.value);
            }}
            onBlur={() => void titleSave.flush()}
            placeholder="Untitled Note"
            aria-label="Note title"
            className="w-full bg-transparent font-display text-2xl font-bold tracking-tight text-ink outline-none placeholder:text-faint md:text-3xl"
          />

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-faint">
            <span>{formatFullDate(note.created_at)}</span>
            {!manual && (
              <>
                <span aria-hidden>·</span>
                <span>{formatDuration(note.duration_seconds)}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <TagsPopover
              tags={note.tags ?? []}
              suggestions={suggestions}
              onChange={(tags) =>
                updateNote.mutate({ id: noteId, patch: { tags } })
              }
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-6 md:px-8">
        {note.audio_path && (
          <AudioPlayer
            path={note.audio_path}
            durationSeconds={note.duration_seconds}
            className="mb-6"
          />
        )}

        <Tabs defaultValue="notes">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              {hasTranscript && (
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              )}
            </TabsList>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (editing) void bodySave.flush();
                setEditing((value) => !value);
              }}
            >
              {editing ? (
                <>
                  <Eye className="size-4" />
                  Preview
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  Edit
                </>
              )}
            </Button>
          </div>

          <TabsContent value="notes" className="mt-5">
            {editing ? (
              <Textarea
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                  bodySave.schedule(event.target.value);
                }}
                onBlur={() => void bodySave.flush()}
                rows={22}
                placeholder="Write your note, or run a rewrite to generate one."
                className="font-mono text-[14px] leading-relaxed"
                aria-label="Note body"
              />
            ) : body.trim() ? (
              <div className="rounded-2xl border border-hairline bg-white p-5 md:p-7">
                <Markdown>{body}</Markdown>
              </div>
            ) : (
              <EmptyBody
                manual={manual}
                onEdit={() => setEditing(true)}
                onRewrite={() => setRewriteOpen(true)}
              />
            )}
          </TabsContent>

          {hasTranscript && (
            <TabsContent value="transcript" className="mt-5">
              <div className="rounded-2xl border border-hairline bg-white p-5 md:p-7">
                <div className="space-y-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                  {note.transcribe_text}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <RewriteSheet
        note={note}
        open={rewriteOpen}
        onOpenChange={setRewriteOpen}
        onApplied={(result) => setBody(result)}
      />
    </>
  );
}

function TagsPopover({
  tags,
  suggestions,
  onChange,
}: {
  tags: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink data-[state=open]:bg-surface">
        <Tag className="size-3.5" />
        {tags.length > 0 ? tags.join(", ") : "Add tags"}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="mb-2 text-xs font-semibold text-faint">Tags</p>
        <TagInput value={tags} onChange={onChange} suggestions={suggestions} />
      </PopoverContent>
    </Popover>
  );
}

function EmptyBody({
  manual,
  onEdit,
  onRewrite,
}: {
  manual: boolean;
  onEdit: () => void;
  onRewrite: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-white py-14 text-center">
      <p className="font-display text-[17px] font-semibold text-ink">
        No notes yet
      </p>
      <p className="mx-auto mt-1 max-w-sm text-[15px] leading-relaxed text-muted">
        {manual
          ? "Write something, or turn this into a structured format with a rewrite."
          : "Run a rewrite to turn the transcript into meeting notes, an email, a summary or any other format."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={onRewrite}>
          <Sparkles className="size-4" />
          Rewrite
        </Button>
        <Button size="sm" variant="secondary" onClick={onEdit}>
          <Pencil className="size-4" />
          Write it yourself
        </Button>
      </div>
    </div>
  );
}

function NoteDetailSkeleton() {
  return (
    <div className="px-5 py-6 md:px-8">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-5 h-9 w-2/3" />
      <Skeleton className="mt-3 h-4 w-52" />
      <Skeleton className="mt-8 h-9 w-44 rounded-full" />
      <Skeleton className="mt-5 h-80 rounded-2xl" />
    </div>
  );
}
