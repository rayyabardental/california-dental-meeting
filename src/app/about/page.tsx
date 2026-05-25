import type { Metadata } from "next";
import { About } from "@/components/sections/about";
import { AboutExtended } from "@/components/sections/about-extended";
import { Testimonials } from "@/components/sections/testimonials";

export const metadata: Metadata = {
  title: "About",
  description:
    "California Dental Meeting is an international continuing-education organisation founded and directed by Dr. Wilmer Yabar. Mission, team, credentials, and international partnerships behind our live-patient implant programmes.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · California Dental Meeting",
    description:
      "International continuing-education organisation delivering live-patient surgical training in partnership with academic institutions across the Americas.",
    url: "/about",
  },
};

export default function AboutPage(): React.ReactElement {
  return (
    <>
      <About />
      <AboutExtended />
      <Testimonials />
    </>
  );
}
