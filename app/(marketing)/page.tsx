import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Possibilities } from "@/components/sections/Possibilities";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { UseCases } from "@/components/sections/UseCases";
import { InsideSvar } from "@/components/sections/InsideSvar";
import { Capabilities } from "@/components/sections/Capabilities";
import { IdeasCta } from "@/components/sections/IdeasCta";
import { Footer } from "@/components/sections/Footer";
// FAQ is intentionally hidden for now — re-add <Faq /> before IdeasCta when needed.

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Possibilities />
      <HowItWorks />
      <UseCases />
      <InsideSvar />
      <Capabilities />
      <IdeasCta />
      <Footer />
    </main>
  );
}
