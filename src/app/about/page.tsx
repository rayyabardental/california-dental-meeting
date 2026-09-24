import type { Metadata } from "next";
import { About } from "@/components/sections/about";
import { AboutExtended } from "@/components/sections/about-extended";
import { Testimonials } from "@/components/sections/testimonials";
import { OrganizationJsonLd } from "@/components/seo/organization-jsonld";

export const metadata: Metadata = {
  title: "About",
  description:
    "California Dental Meeting is an international continuing-education organization owned and governed by ISADe — the International Society of Advanced Dentistry — and directed by Dr. Wilmer Yabar. Mission, team, credentials, and international partnerships behind our live-patient implant programs.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · California Dental Meeting",
    description:
      "Part of ISADe — the International Society of Advanced Dentistry. Live-patient surgical training in partnership with academic institutions across the Americas.",
    url: "/about",
  },
};

export default function AboutPage(): React.ReactElement {
  return (
    <>
      <OrganizationJsonLd />
      <About />
      <AboutExtended />
      <Testimonials />
    </>
  );
}
