import type { Metadata } from "next";
import { Courses } from "@/components/sections/courses";
import { EventsMap } from "@/components/sections/events-map";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "California Dental Meeting's course catalogue — flagship Veracruz programme and upcoming California and international cohorts. Live-patient surgical training, hands-on workshops, and academic-partner certificates.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Courses · California Dental Meeting",
    description:
      "Live-patient implant surgery training. Flagship Veracruz 2026 plus upcoming California and international cohorts.",
    url: "/courses",
  },
};

export default function CoursesPage(): React.ReactElement {
  return (
    <>
      <Courses />
      <EventsMap />
    </>
  );
}
