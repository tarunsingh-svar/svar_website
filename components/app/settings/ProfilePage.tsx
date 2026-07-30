"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/components/app/SessionProvider";
import { planLabel } from "@/lib/plan";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";

export function ProfilePage() {
  const router = useRouter();
  const { user, plan } = useSession();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const dirty = name.trim() !== user.name.trim();

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const supabase = createClient();
    // onConflict: "email" matches the mobile app's upsert key.
    const { error } = await supabase.from("user_details").upsert(
      { user_id: user.id, email: user.email, name: name.trim() },
      { onConflict: "email" }
    );

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  }

  async function copyUserId() {
    await navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-8 md:px-8">
      <Link
        href="/app/settings"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Settings
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <Avatar
          src={user.avatarUrl}
          name={name || user.email}
          className="size-16"
        />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            {name || "Your profile"}
          </h1>
          <p className="truncate text-[15px] text-muted">{user.email}</p>
        </div>
      </div>

      <form onSubmit={save} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled readOnly />
          <p className="text-xs text-faint">
            Your email comes from how you signed in and can&apos;t be changed
            here.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Plan</Label>
          <div className="flex items-center justify-between rounded-xl border border-hairline bg-surface px-4 py-3">
            <span className="text-[15px] font-medium text-ink">
              {planLabel(plan)}
            </span>
            <Link
              href="/app/upgrade"
              className="text-sm font-semibold text-primary hover:text-primary-bright"
            >
              Manage
            </Link>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>User ID</Label>
          <button
            type="button"
            onClick={() => void copyUserId()}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 text-left transition-colors hover:bg-hairline/40"
          >
            <span className="truncate font-mono text-[13px] text-muted">
              {user.id}
            </span>
            {copied ? (
              <Check className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <Copy className="size-4 shrink-0 text-faint" />
            )}
          </button>
          <p className="text-xs text-faint">
            Include this if you contact support.
          </p>
        </div>

        <Button type="submit" loading={saving} disabled={!dirty}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
