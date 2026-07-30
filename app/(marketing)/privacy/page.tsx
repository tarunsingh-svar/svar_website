import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { privacyPolicy } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — SVAR AI",
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={privacyPolicy} />;
}
