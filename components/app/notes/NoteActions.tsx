"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  FileDown,
  MoreHorizontal,
  Share2,
  Trash2,
} from "lucide-react";
import { useDeleteNote, type Note } from "@/lib/queries/notes";
import { exportNoteToPdf } from "@/lib/export/pdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";

export function NoteActions({ note }: { note: Note }) {
  const router = useRouter();
  const deleteNote = useDeleteNote();
  const [confirming, setConfirming] = useState(false);

  const title = note.title?.trim() || "Untitled Note";
  const body = note.summary_text?.trim() || note.transcribe_text?.trim() || "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${body}`);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Your browser blocked clipboard access.");
    }
  }

  async function share() {
    // Web Share is only available over HTTPS and mostly on mobile; fall back
    // to the clipboard everywhere else.
    if (typeof navigator.share !== "function") {
      await copy();
      return;
    }
    try {
      await navigator.share({ title, text: body });
    } catch (error) {
      if ((error as Error).name !== "AbortError") await copy();
    }
  }

  async function remove() {
    try {
      await deleteNote.mutateAsync(note.id);
      setConfirming(false);
      toast.success("Note deleted");
      router.push("/app");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't delete the note."
      );
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full border border-hairline p-2.5 text-muted transition-colors hover:bg-surface hover:text-ink data-[state=open]:bg-surface"
          aria-label="Note actions"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => void copy()}>
            <Copy className="size-4" />
            Copy text
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void share()}>
            <Share2 className="size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => exportNoteToPdf(note)}>
            <FileDown className="size-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setConfirming(true)}>
            <Trash2 className="size-4" />
            Delete note
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this note?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo; and its recording will be permanently removed.
            This can&apos;t be undone, and it won&apos;t free up a slot on the
            free plan.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteNote.isPending}
              onClick={() => void remove()}
            >
              Delete note
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
