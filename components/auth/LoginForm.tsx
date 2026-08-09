"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { GoogleMark } from "@/components/auth/GoogleMark";

type Mode = "choose" | "signin" | "signup";

const MIN_PASSWORD_LENGTH = 8;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const errorParam = params.get("error");

  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (errorParam) toast.error(errorParam);
  }, [errorParam]);

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const safeNext = next.startsWith("/") ? next : "/app";

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

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push(safeNext);
    router.refresh();
  }

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Auto-confirm is enabled in Supabase → session is set immediately.
    // If Confirm email is still on, there is no session yet.
    if (!data.session) {
      toast.error(
        'Account created, but email confirmation is still required. Disable "Confirm email" in Supabase Auth settings for instant sign-up.'
      );
      return;
    }
    router.push(safeNext);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {mode === "signup"
            ? "Sign up to capture notes across every device."
            : "Sign in to pick up your notes on any device."}
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
            onClick={() => setMode("signin")}
          >
            <Mail className="size-[18px]" />
            Continue with email
          </Button>
        </div>
      ) : (
        <form
          onSubmit={mode === "signin" ? signIn : signUp}
          className="space-y-4"
        >
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
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                minLength={MIN_PASSWORD_LENGTH}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" loading={pending}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <div className="flex flex-col items-center gap-3">
            {mode === "signin" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setConfirmPassword("");
                }}
                className="text-sm font-semibold text-primary hover:text-primary-bright"
              >
                Create an account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-sm font-semibold text-primary hover:text-primary-bright"
              >
                Already have an account? Sign in
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMode("choose");
                setPassword("");
                setConfirmPassword("");
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
            >
              <ArrowLeft className="size-4" />
              All sign-in options
            </button>
          </div>
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
    </div>
  );
}
