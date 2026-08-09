import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Completes Google OAuth (PKCE) sign-in.
 * Email + password auth establishes a session in the browser and never
 * hits this route.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  const next = searchParams.get("next");
  const redirectTo = next?.startsWith("/") ? next : "/app";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${redirectTo}`);
    return failed(origin, error.message);
  }

  return failed(origin, "The sign-in link is missing or malformed.");
}

function failed(origin: string, message: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}
