"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Status = "idle" | "loading" | "success" | "error";

export function EmailCapture({
  source,
  dark = false,
  className,
}: {
  source: string;
  dark?: boolean;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          company: (form.get("company") as string) ?? "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex h-13 items-center justify-center gap-2 rounded-full px-6 font-semibold",
          dark ? "bg-white/10 text-white" : "bg-emerald-50 text-mint",
          className
        )}
        role="status"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5.5 9.2L8 11.5L12.5 6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        You&apos;re on the list — we&apos;ll be in touch soon.
      </div>
    );
  }

  return (
    <div className={cn("w-full min-w-0", className)}>
      <form
        onSubmit={submit}
        className={cn(
          "flex w-full min-w-0 flex-col gap-3.5 transition-colors sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:border sm:p-1.5 sm:pl-5",
          dark
            ? "sm:border-white/20 sm:bg-white/10 sm:backdrop-blur sm:focus-within:border-white/50"
            : "sm:border-hairline sm:bg-white sm:shadow-[0_8px_30px_-12px_rgba(4,16,43,0.15)] sm:focus-within:border-primary/50"
        )}
      >
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute h-0 w-0 overflow-hidden opacity-0"
        />
        <label htmlFor={`email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`email-${source}`}
          type="email"
          data-appearance={dark ? "dark" : "light"}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@work.com"
          className={cn(
            "box-border w-full min-w-0 flex-1 rounded-2xl border px-5 py-4 text-base leading-normal outline-none transition-colors",
            "min-h-16 sm:h-auto sm:min-h-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-2 sm:text-[15px] sm:leading-normal",
            "max-sm:shadow-[0_2px_8px_-2px_rgba(4,16,43,0.08)]",
            dark
              ? "border-white/25 bg-white/10 text-white placeholder:text-blue-100/50 focus:border-white/50 sm:focus:border-0"
              : "border-hairline bg-white text-ink placeholder:text-faint focus:border-primary/50 sm:focus:border-0"
          )}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={cn(
            "box-border w-full min-h-16 shrink-0 rounded-2xl px-6 py-4 font-display text-base font-semibold leading-normal transition-colors",
            "sm:h-11 sm:min-h-0 sm:w-auto sm:rounded-full sm:py-0 sm:text-[15px]",
            dark
              ? "bg-white text-primary-deep hover:bg-blue-50"
              : "bg-primary text-white hover:bg-primary-bright",
            status === "loading" && "opacity-70"
          )}
        >
          {status === "loading" ? "Joining…" : "Get Early Access"}
        </button>
      </form>
      {status === "error" && (
        <p
          className={cn(
            "mt-2 text-sm",
            dark ? "text-red-300" : "text-[#e63946]"
          )}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  );
}
