"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { GoogleMark } from "@/components/auth/GoogleMark";

type Mode = "choose" | "email" | "sent";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const errorParam = params.get("error");

  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (errorParam) toast.error(errorParam);
  }, [errorParam]);

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function signInWithGoogle() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(),
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      setPending(false);
      toast.error(error.message);
    }
    // On success the browser navigates away, so pending stays true.
  }

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl() },
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMode("sent");
  }

  return (
    <div className="w-full max-w-sm">
      {mode === "sent" ? (
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="size-7 text-emerald-600" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Check your inbox
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            We sent a sign-in link to <strong className="text-ink">{email}</strong>.
            It expires in an hour.
          </p>
          <button
            onClick={() => setMode("email")}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-bright"
          >
            <ArrowLeft className="size-4" />
            Use a different email
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              Sign in to pick up your notes on any device.
            </p>
          </div>

          {mode === "choose" ? (
            <div className="space-y-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={signInWithGoogle}
                loading={pending}
              >
                <GoogleMark />
                Continue with Google
              </Button>
              <Button
                variant="subtle"
                size="lg"
                className="w-full"
                onClick={() => setMode("email")}
              >
                <Mail className="size-[18px]" />
                Continue with email
              </Button>
            </div>
          ) : (
            <form onSubmit={sendMagicLink} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={pending}
              >
                Send sign-in link
              </Button>
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
              >
                <ArrowLeft className="size-4" />
                All sign-in options
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-faint">
            By continuing you agree to our{" "}
            <a href="/terms" className="underline hover:text-muted">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-muted">
              Privacy Policy
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
