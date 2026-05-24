import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";

export const metadata: Metadata = {
  title:
    "California Dental Meeting — International Education · Clinical Excellence",
  description:
    "Live-patient implant surgery training in Veracruz, Mexico. 35 CE credits, 15–20 implants placed per participant, directed by Dr. Jaime Franco in partnership with Universidad CEYESOV.",
  alternates: { canonical: "/" },
};

export default function HomePage(): React.ReactElement {
  return <Hero />;
}
