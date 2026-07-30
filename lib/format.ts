import { formatDistanceToNow, format, isThisYear, isToday } from "date-fns";

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(rest)}`
    : `${minutes}:${pad(rest)}`;
}

export function formatNoteDate(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
  return isThisYear(date)
    ? format(date, "d MMM")
    : format(date, "d MMM yyyy");
}

export function formatFullDate(iso: string): string {
  return format(new Date(iso), "d MMM yyyy 'at' HH:mm");
}

/** First meaningful line of a note, for list previews. */
export function notePreview(
  summary: string | null,
  transcript: string | null
): string {
  const source = (summary ?? "").trim() || (transcript ?? "").trim();
  if (!source) return "No content yet";
  return source
    .split("\n")
    .map((line) => line.replace(/^[#>\-*\s\[\]x]+/i, "").trim())
    .find((line) => line.length > 0)
    ?.slice(0, 180) ?? "No content yet";
}
