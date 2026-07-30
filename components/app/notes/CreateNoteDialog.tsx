"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateNote } from "@/lib/queries/notes";
import { useSession } from "@/components/app/SessionProvider";
import { usePaywall } from "@/lib/stores/paywall";
import { canCreateNote, FREE_NOTE_LIMIT } from "@/lib/plan";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { TagInput } from "@/components/app/notes/TagInput";

export function CreateNoteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { plan } = useSession();
  const showPaywall = usePaywall((state) => state.showPaywall);
  const createNote = useCreateNote();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  function reset() {
    setTitle("");
    setBody("");
    setTags([]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!canCreateNote(plan)) {
      onOpenChange(false);
      showPaywall(
        `You've reached the free limit of ${FREE_NOTE_LIMIT} notes. Upgrade to Pro for unlimited notes.`
      );
      return;
    }

    try {
      const note = await createNote.mutateAsync({ title, body, tags });
      reset();
      onOpenChange(false);
      router.push(`/app/notes/${note.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't create the note."
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
            <DialogDescription>
              Write it down now — you can run any rewrite on it later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Untitled Note"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-body">Note</Label>
              <Textarea
                id="note-body"
                rows={7}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What's on your mind?"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tags</Label>
              <TagInput value={tags} onChange={setTags} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" loading={createNote.isPending}>
              Create note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
