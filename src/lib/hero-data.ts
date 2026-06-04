import { FLAGSHIP_COURSE, findEvent, ceLabel } from "@/lib/events-data";

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
    "California Dental Meeting is an international continuing-education organization built on clinical competence through hands-on CE and supervised live-patient surgical training. In partnership with academic institutions across the Americas, we run intensive programs where dentists complete real surgical cases — not models alone — under direct faculty supervision.",
};

/* -------------------------------------------------------------------------- */
/* Carousel slides                                                            */
/* -------------------------------------------------------------------------- */

const flagshipHref = `/courses/${FLAGSHIP_COURSE.slug}`;
const flagshipCourseType = FLAGSHIP_COURSE.type;
const flagshipDates = FLAGSHIP_COURSE.dateLabel;
const flagshipCE = ceLabel(FLAGSHIP_COURSE);
const flagshipInstructor = `${FLAGSHIP_COURSE.speaker.name} · ${FLAGSHIP_COURSE.speaker.title}`;
const flagshipStatus = FLAGSHIP_COURSE.status;

const IDES = findEvent("ides_kerala_2026")!;
const SIDHE = findEvent("sidhe_shenzhen_2026")!;
const BIOMIMETICS = findEvent("cdm_biomimetics_2026")!;
const PERIODONTAL = findEvent("cdm_periodontal_2026")!;
const OCCLUSION = findEvent("cdm_occlusion_2026")!;

/** Build a carousel slide from one of the California flyer courses. */
function californiaSlide(course: typeof BIOMIMETICS): CarouselSlide {
  return {
    id: course.id,
    image: course.flyerImage!,
    alt: `${course.title} — California Dental Meeting CE lecture by ${course.speaker.name}, ${course.dateLabel}, ${course.city}, ${course.country}. 7 hours of CE approved by the DBC.`,
    headline: `${course.speaker.name}.`,
    courseTitle: course.title,
    courseType: course.type,
    location: `${course.city}, ${course.country}`,
    dates: course.dateLabel,
    ceCredits: ceLabel(course),
    description: course.summary,
    ctaText: "View course",
    ctaHref: `/courses/${course.slug}`,
    instructor: course.speaker.name,
    status: course.status,
    // Full poster artwork — contain keeps the whole flyer visible.
    imageFit: "contain",
  };
}

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
    ctaText: "View Veracruz 2027",
    ctaHref: flagshipHref,
    instructor: flagshipInstructor,
    status: flagshipStatus,
    // Image has overlay text near the left edge — contain keeps it visible.
    imageFit: "contain",
  },
  {
    id: "veracruz-universidad",
    image: "/carousel/universidad.png",
    alt: "California Dental Meeting cohort outside the entrance to Universidad CEYESOV, the academic host of the Veracruz program.",
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
  {
    id: "ides-kerala-2026",
    image: "/carousel/ides-2026.png",
    alt: "IDES 2026 save-the-date — Intercontinental Dental Excellence Summit, 23–25 October 2026, Lemongrass Hill, Kerala, India. Hosted by Indian Dentist Research & Review and ISADe (International Society of Advanced Dentistry).",
    headline: "Kerala, India.",
    courseTitle: IDES.title,
    courseType: IDES.type,
    location: `${IDES.city}, ${IDES.country}`,
    dates: IDES.dateLabel,
    ceCredits: ceLabel(IDES),
    description:
      "Three days of intercontinental dental education at Lemongrass Hill, Kerala — hosted by ISADe and Indian Dentist Research & Review. Full program details at IDESsummit.com.",
    ctaText: "IDES 2026 details",
    ctaHref: `/courses/${IDES.slug}`,
    instructor: IDES.speaker.name,
    status: IDES.status,
    // Save-the-date poster has text near the edges — contain keeps it readable.
    imageFit: "contain",
  },
  {
    id: "sidhe-shenzhen-2026",
    image: "/carousel/sidhe-2026.png",
    alt: "SIDHE 2026 save-the-date — Shenzhen International Dental High-Tech, December 9–11, 2026, Shenzhen, China. Co-hosted by SIDHE, ISADe, and FDILA.",
    headline: "Shenzhen, China.",
    courseTitle: SIDHE.title,
    courseType: SIDHE.type,
    location: `${SIDHE.city}, ${SIDHE.country}`,
    dates: SIDHE.dateLabel,
    ceCredits: ceLabel(SIDHE),
    description:
      "Dental innovation meets the Pearl River Delta — co-presented by SIDHE, ISADe, and the Federación Dental Ibero Latino Americana (FDILA). More details coming soon.",
    ctaText: "SIDHE 2026 details",
    ctaHref: `/courses/${SIDHE.slug}`,
    instructor: SIDHE.speaker.name,
    status: SIDHE.status,
    // Save-the-date poster — contain preserves the full layout & logos.
    imageFit: "contain",
  },
  californiaSlide(BIOMIMETICS),
  californiaSlide(PERIODONTAL),
  californiaSlide(OCCLUSION),
];
