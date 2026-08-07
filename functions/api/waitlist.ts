import { createClient } from "@supabase/supabase-js";

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** Per-isolate rate limit — same tradeoff as the Next.js route. */
const attempts = new Map<string, { count: number; resetAt: number }>();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP")?.trim() ?? "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = clientIp(context.request);
  if (rateLimited(ip)) {
    return json({ error: "Too many attempts. Please try again later." }, 429);
  }

  let body: { email?: string; source?: string; company?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  if (body.company) {
    return json({ ok: true });
  }

  const url = context.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Waitlist: missing Supabase env vars");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("waitlist").insert({
    email,
    source: body.source?.slice(0, 64) ?? "website",
    user_agent: context.request.headers.get("user-agent")?.slice(0, 256) ?? null,
  });

  if (error && error.code !== "23505") {
    console.error("Waitlist insert failed:", error.message);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  return json({ ok: true });
};
