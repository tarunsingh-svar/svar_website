import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { termsOfService } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service — SVAR AI",
};

export default function TermsPage() {
  return <LegalPage title="Terms of Service" sections={termsOfService} />;
}
