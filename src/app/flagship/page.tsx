import type { Metadata } from "next";
import { EarlyRegistrationBanner } from "@/components/sections/early-registration-banner";
import { FlagshipCourse } from "@/components/sections/flagship-course";
import { Curriculum } from "@/components/sections/curriculum";
import { Included } from "@/components/sections/included";

export const metadata: Metadata = {
  title: "Veracruz 2026 — Flagship Course",
  description:
    "Seven-day immersive implantology programme with live-patient surgery at Universidad CEYESOV, Veracruz. 35 CE credits, 15–20 implants per participant, directed by Dr. Jaime Franco. Early-registration pricing available.",
  alternates: { canonical: "/flagship" },
  openGraph: {
    title: "Veracruz 2026 — Flagship Course",
    description:
      "Live-patient implant surgery training in Veracruz, Mexico. Early-registration pricing available.",
    url: "/flagship",
  },
};

export default function FlagshipPage(): React.ReactElement {
  return (
    <>
      <EarlyRegistrationBanner />
      <FlagshipCourse />
      <Curriculum />
      <Included />
    </>
  );
}
