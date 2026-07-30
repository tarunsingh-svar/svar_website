import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/session";
import { serverEnv } from "@/lib/env";
import { getRewriteOption } from "@/lib/rewrites";
import { isRewriteAllowed } from "@/lib/plan";

const schema = z.object({
  rewriteId: z.string().min(1).max(64),
  text: z.string().min(1).max(200_000),
});

// Render cold starts plus a long transcript can take a while.
export const maxDuration = 120;

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const option = getRewriteOption(parsed.data.rewriteId);
  if (!option) {
    return NextResponse.json(
      { error: "Unknown rewrite option." },
      { status: 400 }
    );
  }

  // Enforced here rather than in the client: the UI lock is only a hint.
  if (!isRewriteAllowed(auth.plan, option.id)) {
    return NextResponse.json(
      { error: `${option.title} is available on the Pro plan.` },
      { status: 402 }
    );
  }

  try {
    const upstream = await fetch(`${serverEnv.aiApiUrl}${option.endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify({ text: parsed.data.text }),
      signal: AbortSignal.timeout(110_000),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error(
        `Rewrite ${option.id} upstream ${upstream.status}: ${detail.slice(0, 300)}`
      );
      return NextResponse.json(
        { error: "The rewrite service is unavailable. Please try again." },
        { status: 502 }
      );
    }

    const payload = (await upstream.json()) as { result?: string };
    const result = payload.result?.trim();

    if (!result || result === "Error generating rewrite") {
      return NextResponse.json(
        { error: "Couldn't generate that rewrite. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error(`Rewrite ${option.id} failed:`, error);
    return NextResponse.json(
      {
        error: timedOut
          ? "That took too long. The AI service may be waking up — try again."
          : "The rewrite service is unavailable. Please try again.",
      },
      { status: 504 }
    );
  }
}
