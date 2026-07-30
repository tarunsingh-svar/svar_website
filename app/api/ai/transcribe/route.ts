import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/session";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { maxRecordingSeconds } from "@/lib/plan";
import { AUDIO_BUCKET } from "@/lib/queries/audio";

const schema = z.object({
  audioPath: z.string().min(1).max(512),
  durationSeconds: z.number().int().min(0).max(24 * 60 * 60),
});

/** Long enough for Flask to download the object and queue the job. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { audioPath, durationSeconds } = parsed.data;

  // Storage objects are namespaced by owner; refuse anything outside the
  // caller's prefix so a crafted path can't transcribe someone else's audio.
  if (!audioPath.startsWith(`${auth.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const limit = maxRecordingSeconds(auth.plan);
  if (durationSeconds > limit) {
    return NextResponse.json(
      {
        error: `Free recordings are limited to ${Math.floor(limit / 60)} minutes. Upgrade to Pro for unlimited length.`,
      },
      { status: 402 }
    );
  }

  const supabase = await createClient();
  const { data: signed, error: signError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(audioPath, SIGNED_URL_TTL_SECONDS);

  if (signError || !signed) {
    console.error("Transcribe: could not sign audio URL", signError);
    return NextResponse.json(
      { error: "Couldn't read the recording. Please try again." },
      { status: 500 }
    );
  }

  try {
    const upstream = await fetch(`${serverEnv.aiApiUrl}/transcribe_url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify({ audio_url: signed.signedUrl }),
      signal: AbortSignal.timeout(50_000),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error(
        `Transcribe upstream ${upstream.status}: ${detail.slice(0, 300)}`
      );
      return NextResponse.json(
        { error: "The transcription service is unavailable." },
        { status: 502 }
      );
    }

    const payload = (await upstream.json()) as { job_id?: string };
    if (!payload.job_id) {
      return NextResponse.json(
        { error: "The transcription service returned an unexpected response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ jobId: payload.job_id });
  } catch (error) {
    console.error("Transcribe request failed:", error);
    return NextResponse.json(
      { error: "The transcription service is waking up. Please try again." },
      { status: 504 }
    );
  }
}
