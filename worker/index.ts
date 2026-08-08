interface Env {
  ASSETS: Fetcher;
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
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

async function handleWaitlist(request: Request, env: Env): Promise<Response> {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return json({ error: "Too many attempts. Please try again later." }, 429);
  }

  let body: { email?: string; source?: string; company?: string };
  try {
    body = await request.json();
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

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Waitlist: missing Supabase env vars");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  const response = await fetch(`${url}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      email,
      source: body.source?.slice(0, 64) ?? "website",
      user_agent: request.headers.get("user-agent")?.slice(0, 256) ?? null,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    // 23505 duplicate — treat as success so the form can't probe membership.
    if (detail.includes("23505")) {
      return json({ ok: true });
    }
    console.error("Waitlist insert failed:", response.status, detail.slice(0, 300));
    return json({ error: "Something went wrong. Please try again." }, 500);
  }

  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/waitlist" && request.method === "POST") {
      return handleWaitlist(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
