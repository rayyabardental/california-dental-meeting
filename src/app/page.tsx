import type { Metadata } from "next";
import { HeroSplit } from "@/components/sections/hero-split";
import { HERO_MASCOT, HERO_MISSION, HERO_SLIDES } from "@/lib/hero-data";

export const metadata: Metadata = {
  title:
    "California Dental Meeting — International Education · Clinical Excellence",
  description:
    "California Dental Meeting — founded and directed by Dr. Wilmer Yabar. Next up: SIDHE 2026 in Shenzhen, China, December 9–11 — registration open. Plus the flagship Veracruz live-patient implant program and IDES 2026 in Kerala.",
  alternates: { canonical: "/" },
};

export default function HomePage(): React.ReactElement {
  return (
    <HeroSplit
      mascot={HERO_MASCOT}
      mission={HERO_MISSION}
      slides={HERO_SLIDES}
    />
  );
}
