"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AGE_OPTIONS, PROFESSION_OPTIONS, USAGE_OPTIONS } from "@/lib/onboarding";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const STEPS = ["name", "age", "profession", "usage"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow({
  email,
  suggestedName,
}: {
  email: string;
  suggestedName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState(suggestedName);
  const [age, setAge] = useState<string | null>(null);
  const [profession, setProfession] = useState<string | null>(null);
  const [usage, setUsage] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const index = STEPS.indexOf(step);

  function back() {
    if (index > 0) setStep(STEPS[index - 1]);
  }

  function toggleUsage(option: string) {
    setUsage((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  }

  async function finish() {
    if (usage.length === 0) return;

    const selectedUsage = usage.join(", ");
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      toast.error("Your session expired. Please sign in again.");
      router.push("/login");
      return;
    }

    // onConflict matches the mobile app, which keys this table on email.
    const { error } = await supabase.from("user_details").upsert(
      {
        user_id: user.id,
        email: email || user.email || "",
        name: name.trim(),
        age,
        profession,
        usage: selectedUsage,
      },
      { onConflict: "email" }
    );

    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="glow-primary pointer-events-none absolute inset-x-0 top-0 h-80"
      />

      <header className="relative flex items-center justify-between px-6 py-6">
        <Logo />
        <span className="text-sm font-medium text-faint">
          Step {index + 1} of {STEPS.length}
        </span>
      </header>

      <div className="relative mx-auto h-1 w-full max-w-lg overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <main className="relative flex flex-1 items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {step === "name" && (
            <StepShell
              title="What should we call you?"
              subtitle="This is how your name appears across SVAR."
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setStep("age");
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Alex Sharma"
                    autoFocus
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Continue
                </Button>
              </form>
            </StepShell>
          )}

          {step === "age" && (
            <StepShell title="How old are you?" onBack={back}>
              <OptionGrid
                options={AGE_OPTIONS}
                selected={age}
                onSelect={(value) => {
                  setAge(value);
                  setStep("profession");
                }}
              />
            </StepShell>
          )}

          {step === "profession" && (
            <StepShell title="What best describes you?" onBack={back}>
              <OptionGrid
                options={PROFESSION_OPTIONS}
                selected={profession}
                onSelect={(value) => {
                  setProfession(value);
                  setStep("usage");
                }}
              />
            </StepShell>
          )}

          {step === "usage" && (
            <StepShell
              title="What do you want to use SVAR for?"
              subtitle="Select all that apply. We'll tune your rewrite suggestions around this."
              onBack={back}
            >
              <MultiOptionGrid
                options={USAGE_OPTIONS}
                selected={usage}
                disabled={saving}
                onToggle={toggleUsage}
              />
              <Button
                size="lg"
                className="mt-4 w-full"
                disabled={usage.length === 0 || saving}
                onClick={() => void finish()}
              >
                {saving ? "Setting up your workspace…" : "Continue"}
              </Button>
            </StepShell>
          )}
        </div>
      </main>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      {onBack && (
        <button
          onClick={onBack}
          className="mt-6 text-sm font-semibold text-muted hover:text-ink"
        >
          Back
        </button>
      )}
    </div>
  );
}

function OptionGrid({
  options,
  selected,
  onSelect,
  disabled = false,
}: {
  options: readonly string[];
  selected: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option) => {
        const active = selected === option;
        return (
          <button
            key={option}
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-left text-[15px] font-medium transition-all",
              "disabled:pointer-events-none disabled:opacity-60",
              active
                ? "border-primary bg-blue-50 text-primary-deep"
                : "border-hairline bg-white text-ink hover:border-primary/40 hover:bg-blue-50/40"
            )}
          >
            {option}
            {active && <Check className="size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function MultiOptionGrid({
  options,
  selected,
  onToggle,
  disabled = false,
}: {
  options: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(option)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-left text-[15px] font-medium transition-all",
              "disabled:pointer-events-none disabled:opacity-60",
              active
                ? "border-primary bg-blue-50 text-primary-deep"
                : "border-hairline bg-white text-ink hover:border-primary/40 hover:bg-blue-50/40"
            )}
          >
            {option}
            {active && <Check className="size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
