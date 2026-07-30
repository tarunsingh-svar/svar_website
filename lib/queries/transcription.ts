"use client";

import type { TranscriptionJob } from "@/app/api/ai/transcribe/status/[jobId]/route";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

async function readError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? fallback;
}

/**
 * Kicks off transcription for an object already in Storage and resolves once
 * the job completes. Polling lives on the client so a slow Sarvam job can't hit
 * the serverless function timeout.
 */
export async function transcribeAudio({
  audioPath,
  durationSeconds,
}: {
  audioPath: string;
  durationSeconds: number;
}): Promise<string> {
  const start = await fetch("/api/ai/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioPath, durationSeconds }),
  });

  if (!start.ok) {
    throw new Error(
      await readError(start, "Couldn't start transcription.")
    );
  }

  const { jobId } = (await start.json()) as { jobId: string };
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const response = await fetch(`/api/ai/transcribe/status/${jobId}`);
    if (!response.ok) {
      // A transient upstream blip shouldn't kill the whole recording.
      if (response.status >= 500) continue;
      throw new Error(await readError(response, "Transcription failed."));
    }

    const job = (await response.json()) as TranscriptionJob;

    if (job.status === "complete") {
      return job.transcript?.trim() ?? "";
    }
    if (job.status === "failed") {
      throw new Error(job.error ?? "Transcription failed.");
    }
  }

  throw new Error(
    "Transcription is taking unusually long. Your recording is saved — try again from the note."
  );
}
