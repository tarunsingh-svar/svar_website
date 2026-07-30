"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TranscribeRow } from "@/lib/supabase/types";

export type Note = TranscribeRow;

export const notesKeys = {
  all: ["notes"] as const,
  detail: (id: number) => ["notes", id] as const,
};

/** A note with no recording is a manual text note, same rule as the app. */
export function isManualNote(note: Note): boolean {
  return note.duration_seconds === 0;
}

export function useNotes() {
  return useQuery({
    queryKey: notesKeys.all,
    queryFn: async (): Promise<Note[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transcribe")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export function useNote(id: number) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: notesKeys.detail(id),
    enabled: Number.isFinite(id) && id > 0,
    // Show the row from the list while the full record loads.
    placeholderData: () =>
      queryClient
        .getQueryData<Note[]>(notesKeys.all)
        ?.find((note) => note.id === id),
    queryFn: async (): Promise<Note> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transcribe")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export interface CreateNoteInput {
  title?: string;
  body?: string;
  transcript?: string;
  durationSeconds?: number;
  tags?: string[];
  audioPath?: string | null;
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: CreateNoteInput): Promise<Note> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You are signed out. Please sign in again.");

      const { data, error } = await supabase
        .from("transcribe")
        .insert({
          user_id: user.id,
          title: input.title?.trim() || "Untitled Note",
          transcribe_text: input.transcript ?? "",
          summary_text: input.body ?? "",
          duration_seconds: input.durationSeconds ?? 0,
          tags: input.tags ?? [],
          audio_path: input.audioPath ?? null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (note) => {
      queryClient.setQueryData<Note[]>(notesKeys.all, (previous) =>
        previous ? [note, ...previous] : [note]
      );
      queryClient.setQueryData(notesKeys.detail(note.id), note);
      // notes_created_count is bumped by a DB trigger and read by the server
      // layout, so the remaining-notes badge needs a server re-render.
      router.refresh();
    },
  });
}

export type NoteUpdate = Partial<
  Pick<
    Note,
    | "title"
    | "transcribe_text"
    | "summary_text"
    | "duration_seconds"
    | "tags"
    | "audio_path"
  >
>;

function applyLocalUpdate(
  queryClient: QueryClient,
  id: number,
  patch: NoteUpdate
) {
  queryClient.setQueryData<Note[]>(notesKeys.all, (previous) =>
    previous?.map((note) => (note.id === id ? { ...note, ...patch } : note))
  );
  queryClient.setQueryData<Note>(notesKeys.detail(id), (previous) =>
    previous ? { ...previous, ...patch } : previous
  );
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: NoteUpdate }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("transcribe")
        .update(patch)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id, patch };
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.detail(id) });
      const previousList = queryClient.getQueryData<Note[]>(notesKeys.all);
      const previousNote = queryClient.getQueryData<Note>(notesKeys.detail(id));
      applyLocalUpdate(queryClient, id, patch);
      return { previousList, previousNote, id };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(notesKeys.all, context.previousList);
      queryClient.setQueryData(notesKeys.detail(context.id), context.previousNote);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const supabase = createClient();

      // Remove the audio object first: if this fails the note stays, so the
      // user can retry rather than leaving an orphaned file behind.
      const note = queryClient.getQueryData<Note>(notesKeys.detail(id));
      if (note?.audio_path) {
        await supabase.storage.from("note-audio").remove([note.audio_path]);
      }

      const { error } = await supabase.from("transcribe").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Note[]>(notesKeys.all, (previous) =>
        previous?.filter((note) => note.id !== id)
      );
      queryClient.removeQueries({ queryKey: notesKeys.detail(id) });
    },
  });
}

/** Every distinct tag across the user's notes, alphabetically. */
export function collectTags(notes: Note[]): string[] {
  const seen = new Set<string>();
  for (const note of notes) {
    for (const tag of note.tags ?? []) {
      if (tag.trim()) seen.add(tag.trim());
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}
