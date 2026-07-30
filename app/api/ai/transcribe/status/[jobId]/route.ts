import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/session";
import { serverEnv } from "@/lib/env";

export type TranscriptionStatus = "pending" | "processing" | "complete" | "failed";

export interface TranscriptionJob {
  status: TranscriptionStatus;
  transcript: string | null;
  error: string | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { jobId } = await params;
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(jobId)) {
    return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${serverEnv.aiApiUrl}/transcribe/status/${jobId}`,
      {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      }
    );

    if (upstream.status === 404) {
      return NextResponse.json(
        { error: "That transcription job has expired." },
        { status: 404 }
      );
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Couldn't check the transcription status." },
        { status: 502 }
      );
    }

    return NextResponse.json((await upstream.json()) as TranscriptionJob);
  } catch (error) {
    console.error("Transcription status check failed:", error);
    return NextResponse.json(
      { error: "Couldn't check the transcription status." },
      { status: 504 }
    );
  }
}
