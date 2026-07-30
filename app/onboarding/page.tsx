import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/app/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Set up your account — SVAR AI",
  robots: { index: false },
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const { data: details } = await supabase
    .from("user_details")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (details) redirect("/app");

  const metadata = user.user_metadata ?? {};
  const suggestedName =
    (metadata.full_name as string) || (metadata.name as string) || "";

  return (
    <OnboardingFlow
      email={user.email ?? ""}
      suggestedName={suggestedName}
    />
  );
}
