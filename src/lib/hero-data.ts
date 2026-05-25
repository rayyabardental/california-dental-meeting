import { FLAGSHIP_COURSE } from "@/lib/events-data";

/**
 * Data model for the split-column homepage hero.
 *
 * Kept in this single file so non-engineers (or future you) can update the
 * mascot, mission copy, or carousel slides without touching component code.
 * Carousel slides are content-driven — add a new entry, get a new slide.
 */

export type HeroMascot = {
  mascotImage: string;
  mascotAlt: string;
};

export type HeroMission = {
  missionHeading: string;
  missionText: string;
};

export type CarouselSlide = {
  id: string;
  image: string;
  alt: string;
  /** Slide-specific lead headline, distinct from the formal course title. */
  headline: string;
  courseTitle: string;
  courseType: "CALIFORNIA" | "NATIONAL" | "INTERNATIONAL";
  location: string;
  dates: string;
  ceCredits: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  instructor: string;
  status: "OPEN" | "WAITLIST" | "ANNOUNCING_SOON";
  /**
   * How the image fills the slide frame.
   *  - "cover" (default): fills the frame, may crop edges.
   *  - "contain": shows the entire image, may letterbox top/bottom.
   * Use "contain" when the image has overlay text or important content
   * near the edges that must stay visible.
   */
  imageFit?: "cover" | "contain";
};

/* -------------------------------------------------------------------------- */
/* Left column                                                                */
/* -------------------------------------------------------------------------- */

export const HERO_MASCOT: HeroMascot = {
  mascotImage: "/dentist-mascot.png",
  mascotAlt:
    "Illustration of a thoughtful clinician in a white coat at a desk, with a stethoscope, books, and a coffee — representing the California Dental Meeting community.",
};

export const HERO_MISSION: HeroMission = {
  missionHeading: "Where dentists become surgeons.",
  missionText:
    "California Dental Meeting is an international continuing-education organisation built on clinical competence through hands-on CE and supervised live-patient surgical training. In partnership with academic institutions across the Americas, we run intensive programmes where dentists complete real surgical cases — not models alone — under direct faculty supervision.",
};

/* -------------------------------------------------------------------------- */
/* Carousel slides                                                            */
/* -------------------------------------------------------------------------- */

const flagshipHref = `/courses/${FLAGSHIP_COURSE.slug}`;
const flagshipCourseType = FLAGSHIP_COURSE.type;
const flagshipDates = FLAGSHIP_COURSE.dateLabel;
const flagshipCE = `${FLAGSHIP_COURSE.ceCredits} CE credits`;
const flagshipInstructor = `${FLAGSHIP_COURSE.speaker.name} · ${FLAGSHIP_COURSE.speaker.title}`;
const flagshipStatus = FLAGSHIP_COURSE.status;

export const HERO_SLIDES: ReadonlyArray<CarouselSlide> = [
  {
    id: "veracruz-aerial",
    image: "/carousel/VERACRUZINICIOMOVIL.png",
    alt: "Aerial photograph of Veracruz, Mexico — historic Gulf-coast city seen from above, with 'VERACRUZ' overlay text on the left.",
    headline: "Veracruz, Mexico.",
    courseTitle: FLAGSHIP_COURSE.title,
    courseType: flagshipCourseType,
    location: `${FLAGSHIP_COURSE.city}, ${FLAGSHIP_COURSE.country}`,
    dates: flagshipDates,
    ceCredits: flagshipCE,
    description:
      "Six clinical days on the Gulf coast — at the heart of one of Mexico's most historic cities, hosted by Universidad CEYESOV.",
    ctaText: "View Veracruz 2026",
    ctaHref: flagshipHref,
    instructor: flagshipInstructor,
    status: flagshipStatus,
    // Image has overlay text near the left edge — contain keeps it visible.
    imageFit: "contain",
  },
  {
    id: "veracruz-universidad",
    image: "/carousel/universidad.png",
    alt: "California Dental Meeting cohort outside the entrance to Universidad CEYESOV, the academic host of the Veracruz programme.",
    headline: "Universidad CEYESOV.",
    courseTitle: FLAGSHIP_COURSE.title,
    courseType: flagshipCourseType,
    location: `${FLAGSHIP_COURSE.city}, ${FLAGSHIP_COURSE.country}`,
    dates: flagshipDates,
    ceCredits: flagshipCE,
    description:
      "Live-patient implant surgery alongside an international cohort at one of Mexico's premier dental institutions — every case supervised by faculty.",
    ctaText: "Course details",
    ctaHref: flagshipHref,
    instructor: flagshipInstructor,
    status: flagshipStatus,
  },
  {
    id: "veracruz-zocalo",
    image: "/carousel/b4f995c3-d0cb-4f33-9e96-32ad91e92beb.jpg",
    alt: "Veracruz historic Zócalo plaza at dusk, illuminated by red, white, and green 'Viva México' lights with the cathedral tower in the background.",
    headline: "More than a course.",
    courseTitle: FLAGSHIP_COURSE.title,
    courseType: flagshipCourseType,
    location: `${FLAGSHIP_COURSE.city}, ${FLAGSHIP_COURSE.country}`,
    dates: flagshipDates,
    ceCredits: flagshipCE,
    description:
      "Beyond the clinical days, the historic Zócalo and Gulf coast turn a week of training into a career-defining experience.",
    ctaText: "Reserve your spot",
    ctaHref: flagshipHref,
    instructor: flagshipInstructor,
    status: flagshipStatus,
  },
];
