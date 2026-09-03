import type { Course } from "@/lib/events-data";
import { getSiteUrl } from "@/lib/site-url";

/**
 * schema.org Event markup for a course page.
 *
 * Built from our own typed course data (never user input) and serialised with
 * JSON.stringify, so values are escaped by construction. `<` is additionally
 * escaped so the string can never terminate the script element early.
 */
export function EventJsonLd({ course }: { course: Course }): React.ReactElement {
  const site = getSiteUrl();
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: course.title,
    description: course.summary,
    startDate: course.date,
    ...(course.endDate ? { endDate: course.endDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: `${site}/courses/${course.slug}`,
    location: {
      "@type": "Place",
      name: course.venue ?? `${course.city}, ${course.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: course.city,
        addressCountry: course.country,
      },
    },
    organizer: {
      "@type": "Organization",
      name: "California Dental Meeting",
      url: site,
    },
    ...(course.flyerImage ? { image: [`${site}${course.flyerImage}`] } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\u003c"),
      }}
    />
  );
}
