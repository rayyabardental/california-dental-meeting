import type { Metadata } from "next";
import { HeroSplit } from "@/components/sections/hero-split";
import { HERO_MASCOT, HERO_MISSION, HERO_SLIDES } from "@/lib/hero-data";

export const metadata: Metadata = {
  title:
    "California Dental Meeting — International Education · Clinical Excellence",
  description:
    "Live-patient implant surgery training in Veracruz, Mexico. 35 CE credits, 15–20 implants placed per participant, directed by Dr. Jaime Franco in partnership with Universidad CEYESOV.",
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
