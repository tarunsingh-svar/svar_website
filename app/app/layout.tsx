import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { planStateFromProfile } from "@/lib/plan";
import { SessionProvider, type SessionUser } from "@/components/app/SessionProvider";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "SVAR AI",
  robots: { index: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already guards these routes; this is the type narrowing
  // and a backstop if the matcher ever changes.
  if (!user) redirect("/login?next=/app");

  const [{ data: profile }, { data: details }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_details")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  // Mobile gates onboarding on a local flag; on web the user_details row is
  // the durable equivalent, so it also covers users created on another device.
  if (!details) redirect("/onboarding");

  const metadata = user.user_metadata ?? {};
  const sessionUser: SessionUser = {
    id: user.id,
    email: details.email || user.email || "",
    name:
      details.name ||
      (metadata.full_name as string) ||
      (metadata.name as string) ||
      "",
    avatarUrl:
      (metadata.avatar_url as string) ?? (metadata.picture as string) ?? null,
  };

  return (
    <SessionProvider
      value={{ user: sessionUser, plan: planStateFromProfile(profile) }}
    >
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
