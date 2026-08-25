import type { Metadata } from "next";
import { Courses } from "@/components/sections/courses";
import { EventsMap } from "@/components/sections/events-map";

export const metadata: Metadata = {
  title: "Courses",
    description:
    "California Dental Meeting's course catalogue — SIDHE 2026 in Shenzhen (December 9–11, registration open), the flagship Veracruz live-patient program, and IDES 2026 in Kerala.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Courses · California Dental Meeting",
    description:
      "SIDHE 2026 in Shenzhen, December 9–11 — registration open. Plus the flagship Veracruz live-patient program and IDES 2026 in Kerala.",
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
