import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { FlagshipCourse } from "@/components/sections/flagship-course";
import { Courses } from "@/components/sections/courses";
import { Curriculum } from "@/components/sections/curriculum";
import { Included } from "@/components/sections/included";
import { EventsMap } from "@/components/sections/events-map";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  title:
    "California Dental Meeting — International Education · Clinical Excellence",
  description:
    "Live-patient implant surgery training in Veracruz, Mexico. 35 CE credits, 15–20 implants placed per participant, directed by Dr. Jaime Franco in partnership with Universidad CEYESOV.",
  alternates: { canonical: "/" },
};

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Hero />
      <FlagshipCourse />
      <Courses />
      <Curriculum />
      <Included />
      <EventsMap />
      <About />
      <Testimonials />
      <Contact />
    </>
  );
}
