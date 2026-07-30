import { notFound } from "next/navigation";
import { NoteDetail } from "@/components/app/notes/NoteDetail";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId) || noteId <= 0) notFound();

  return <NoteDetail noteId={noteId} />;
}
