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

function jwtRole(key: string): string | null {
  try {
    const payload = key.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as { role?: string };
    return decoded.role ?? null;
  } catch {
    return null;
  }
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
    // #region agent log
    return json(
      {
        error: "Something went wrong. Please try again.",
        _debug: { hasUrl: !!url, hasKey: !!serviceKey, reason: "missing_env" },
      },
      500
    );
    // #endregion
  }

  const keyRole = jwtRole(serviceKey);
  if (keyRole && keyRole !== "service_role") {
    console.error("Waitlist: SUPABASE_SERVICE_ROLE_KEY has wrong role:", keyRole);
    // #region agent log
    return json(
      {
        error: "Something went wrong. Please try again.",
        _debug: { hasUrl: true, hasKey: true, keyRole, reason: "wrong_key_role" },
      },
      500
    );
    // #endregion
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
    // #region agent log
    return json(
      {
        error: "Something went wrong. Please try again.",
        _debug: {
          hasUrl: true,
          hasKey: true,
          keyRole: keyRole ?? "unknown",
          supabaseStatus: response.status,
          supabaseCode: detail.includes("42501") ? "rls_violation" : "insert_failed",
          reason: "supabase_error",
        },
      },
      500
    );
    // #endregion
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
