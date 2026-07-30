/**
 * Browsers disagree on what MediaRecorder can produce: Chrome and Firefox do
 * WebM/Opus, Safari does MP4/AAC. Pick the first supported option and carry the
 * matching extension through to Storage so Sarvam gets a filename it can read.
 */
const CANDIDATES: { mimeType: string; extension: string }[] = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/mp4;codecs=mp4a.40.2", extension: "m4a" },
  { mimeType: "audio/mp4", extension: "m4a" },
  { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
];

export interface RecordingFormat {
  mimeType: string;
  extension: string;
}

export function pickRecordingFormat(): RecordingFormat | null {
  if (typeof MediaRecorder === "undefined") return null;
  for (const candidate of CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) return candidate;
  }
  // Safari historically returned false for everything while still recording
  // with its default container.
  return { mimeType: "", extension: "m4a" };
}

export function isRecordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}
