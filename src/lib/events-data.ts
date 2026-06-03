import type { EventTypeValue } from "./validations/event";

export type Sponsor = { name: string; note?: string };

/** Icon identifiers used by curriculum schedule rendering. Kept as plain
 * strings so course data stays serializable (no React components in data). */
export type ScheduleIconKey =
  | "plane"
  | "book"
  | "activity"
  | "award"
  | "sun"
  | "clock";

export type ScheduleBlock = {
  time: string;
  activity: string;
  note?: string;
};

export type ScheduleDay = {
  date: string;
  weekday: string;
  title: string;
  icon: ScheduleIconKey;
  blocks: ReadonlyArray<ScheduleBlock>;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  date: string;
  endDate?: string;
  dateLabel: string;
  city: string;
  country: string;
  venue: string;
  venueDetail: string;
  lat: number;
  lng: number;
  type: EventTypeValue;
  capacity: number;
  spotsRemaining: number;
  ceCredits: number;
  topic: string;
  price: string;
  /** Regular tuition price (for early-registration callouts). Optional. */
  regularPrice?: string;
  /** Early-registration price. Optional. */
  earlyPrice?: string;
  /** When true, surface the early-registration callout banner & strikethrough. */
  earlyRegistrationActive?: boolean;
  /**
   * Structured pricing for the online checkout flow, in integer cents (USD).
   * Present ONLY on courses that can be purchased online — gate every
   * checkout code path behind `isPurchasable()` so "Coming soon" courses
   * can never reach the payment screen. The display `price` strings above
   * remain the source of truth for marketing copy; these cents values are
   * the authoritative amounts charged server-side.
   */
  purchase?: {
    currency: string;
    /** Standard tuition. */
    regularCents: number;
    /** Discounted tuition while `earlyRegistrationActive` is true. */
    earlyCents: number;
    /** Reservation deposit to hold a seat; balance collected later. */
    depositCents: number;
  };
  status: "OPEN" | "WAITLIST" | "ANNOUNCING_SOON";
  highlights: ReadonlyArray<string>;
  whatsIncluded: ReadonlyArray<string>;
  idealParticipant: ReadonlyArray<string>;
  learningObjectives: ReadonlyArray<string>;
  clinicalTeam?: ReadonlyArray<{ role: string; description: string }>;
  sponsors?: ReadonlyArray<Sponsor>;
  universityPartner?: string;
  /** Full day-by-day schedule. Optional — courses without a published agenda
   * yet (ANNOUNCING_SOON) leave this undefined and the detail page shows a
   * "to be announced" placeholder instead. */
  schedule?: ReadonlyArray<ScheduleDay>;
  speaker: {
    name: string;
    title: string;
    specialty: string;
    org: string;
    bio?: string;
  };
};

// Aliased so existing imports of `Event` continue to compile.
export type Event = Course;

export const EVENTS: readonly Course[] = [
  {
    id: "cdm_veracruz_2026",
    slug: "basic-dental-implant-course-veracruz-2026",
    title: "Basic Dental Implant Course",
    subtitle: "Live Patient Surgery · Hands-On Training · International Faculty",
    summary:
      "Seven-day immersive implantology program with live patient surgery under direct faculty supervision at Universidad CEYESOV, Veracruz.",
    description:
      "An intensive, immersive implantology program offering live patient surgery under direct faculty supervision at Universidad CEYESOV, Veracruz, Mexico. Participants complete real surgical cases alongside peers, building confidence and clinical mastery in modern implant dentistry within a structured, team-based educational environment.",
    date: "2027-08-30T00:00:00.000Z",
    endDate: "2027-09-05T00:00:00.000Z",
    dateLabel: "Aug 30 – Sep 5, 2027",
    city: "Veracruz",
    country: "Mexico",
    venue: "Universidad CEYESOV",
    venueDetail:
      "One of Mexico's premier dental education institutions. Veracruz is a historic Pacific-coast city offering an exceptional setting for international, immersive implantology training.",
    lat: 19.1738,
    lng: -96.1342,
    type: "INTERNATIONAL",
    capacity: 24,
    spotsRemaining: 9,
    ceCredits: 35,
    topic: "Implantology · Live Surgery",
    price: "$9,990",
    regularPrice: "$10,500",
    earlyPrice: "$9,990",
    earlyRegistrationActive: true,
    purchase: {
      currency: "usd",
      regularCents: 1_050_000,
      earlyCents: 999_000,
      depositCents: 100_000,
    },
    status: "OPEN",
    highlights: [
      "15–20 implants placed per participant",
      "Live patient surgery (Mon–Fri)",
      "7 days · 6 clinical days",
      "Team-based surgical workflow",
      "Hands-on workshops with anatomical models",
      "Final clinical case presentation",
    ],
    whatsIncluded: [
      "7 nights hotel accommodation",
      "Daily transportation hotel ↔ university",
      "Surgical scrubs & caps",
      "Hands-on surgical training with models",
      "Live patient surgical experience",
      "Daily lunch throughout the course",
      "Course backpack & documentation",
      "Technical manuals & support materials",
      "Graduation ceremony & dinner",
      "Certificate of completion · 35 CE Credits",
      "Optional one-day Veracruz city tour (Sep 5)",
    ],
    idealParticipant: [
      "General dentists entering implantology",
      "Dentists beginning implant placement",
      "Clinicians seeking more surgical experience",
      "Professionals seeking supervised live-patient training",
    ],
    learningObjectives: [
      "Diagnose and treatment-plan implant cases",
      "Perform implant osteotomy protocols",
      "Participate in supervised live patient surgeries",
      "Develop teamwork in surgical workflow",
      "Review surgical anatomy for implantology",
      "Use implant motors and instrumentation",
      "Improve clinical decision-making",
      "Present and analyze completed cases",
    ],
    clinicalTeam: [
      {
        role: "Primary Operator",
        description: "Performs the implant surgery",
      },
      {
        role: "Surgical Assistant",
        description: "Supports the primary operator",
      },
      {
        role: "Circulating Assistant",
        description: "Manages materials & logistics",
      },
      {
        role: "Clinical Photography Assistant",
        description: "Documents cases for the final presentation",
      },
    ],
    sponsors: [
      { name: "ISADe USA" },
      { name: "FDILA" },
      {
        name: "International Dental Implant Institute",
        note: "IDII",
      },
    ],
    universityPartner: "Universidad CEYESOV — Veracruz",
    speaker: {
      name: "Dr. Jaime Franco",
      title: "Course Director — Veracruz Program",
      specialty: "Implantology",
      org: "California Dental Meeting",
      bio: "Course Director for the Veracruz program, leading the live-patient surgical curriculum in partnership with Universidad CEYESOV. Dr. Franco directs all clinical sessions, oversees treatment planning, and supervises every implant placement performed during the program.",
    },
    schedule: [
      {
        date: "Sun, Aug 30",
        weekday: "Sunday",
        title: "Arrival Day",
        icon: "plane",
        blocks: [
          {
            time: "Upon arrival",
            activity: "Airport transfer to hotel",
            note: "Transportation included",
          },
          {
            time: "Evening",
            activity:
              "Welcome meeting — introductions, materials distribution (backpacks, scrubs, caps), program overview, clinical team organization",
            note: "All participants",
          },
        ],
      },
      {
        date: "Mon, Aug 31",
        weekday: "Monday",
        title: "Theory & First Surgeries",
        icon: "book",
        blocks: [
          {
            time: "8:00 – 10:00 am",
            activity:
              "Theory lecture: diagnosis & treatment planning · surgical anatomy review · anesthesia & drilling protocols · implant motor management",
          },
          { time: "10:00 – 10:30 am", activity: "Coffee break" },
          {
            time: "10:30 am – 12:30 pm",
            activity: "Hands-on workshop with anatomical models",
          },
          { time: "12:30 – 1:30 pm", activity: "Lunch", note: "Included daily" },
          {
            time: "1:30 – 2:00 pm",
            activity:
              "Clinical discussion: afternoon case review · team organization · surgical planning",
          },
          {
            time: "2:00 – 6:00 pm",
            activity: "Live patient surgery",
            note: "Supervised, team-based",
          },
        ],
      },
      {
        date: "Tue–Thu, Sep 1–3",
        weekday: "Tuesday – Thursday",
        title: "Full Surgical Days",
        icon: "activity",
        blocks: [
          {
            time: "8:00 am",
            activity:
              "Clinical discussion: diagnosis & treatment planning · morning case review",
          },
          {
            time: "9:00 am – 12:30 pm",
            activity: "Morning surgical session",
            note: "Live patient cases",
          },
          { time: "12:30 – 1:30 pm", activity: "Lunch" },
          {
            time: "1:30 – 2:00 pm",
            activity:
              "Clinical discussion: afternoon case review · surgical planning",
          },
          {
            time: "2:00 – 6:00 pm",
            activity: "Afternoon surgical session",
            note: "Live patient cases",
          },
        ],
      },
      {
        date: "Fri, Sep 4",
        weekday: "Friday",
        title: "Final Day & Graduation",
        icon: "award",
        blocks: [
          {
            time: "8:00 am",
            activity:
              "Clinical discussion: diagnosis & treatment planning · review of morning surgical cases",
          },
          {
            time: "9:00 am",
            activity:
              "Final surgical session — participants completing surgical requirements may assist fellow participants during remaining procedures",
            note: "Peer-assist option",
          },
          {
            time: "7:00 pm",
            activity:
              "Graduation ceremony & closing dinner: certificate presentation · group recognition · celebration dinner",
            note: "Formal event",
          },
        ],
      },
      {
        date: "Sat, Sep 5",
        weekday: "Saturday",
        title: "Optional Tour Day",
        icon: "sun",
        blocks: [
          {
            time: "All day",
            activity:
              "One-day Veracruz city tour — explore one of Mexico's most historic and beautiful coastal cities",
            note: "Optional · included",
          },
        ],
      },
    ],
  },
  {
    id: "ides_kerala_2026",
    slug: "intercontinental-dental-excellence-summit-2026",
    title: "Intercontinental Dental Excellence Summit",
    subtitle: "IDES 2026 · Kerala, India",
    summary:
      "Three-day intercontinental dental summit hosted by ISADe and Indian Dentist Research & Review at Lemongrass Hill, Kerala.",
    description:
      "An intercontinental gathering of clinicians, researchers, and educators convened by the International Society of Advanced Dentistry (ISADe) and Indian Dentist Research & Review. Full program, faculty, and continuing-education accreditation will be released ahead of the summit. Visit IDESsummit.com for the latest updates.",
    date: "2026-10-23T00:00:00.000Z",
    endDate: "2026-10-25T00:00:00.000Z",
    dateLabel: "Oct 23–25, 2026",
    city: "Lemongrass Hill, Kerala",
    country: "India",
    venue: "Lemongrass Hill",
    venueDetail:
      "Hill-station venue in Kerala, India. Full venue and travel details to be confirmed via IDESsummit.com.",
    lat: 10.0889,
    lng: 77.0595,
    type: "INTERNATIONAL",
    capacity: 200,
    spotsRemaining: 200,
    ceCredits: 0,
    topic: "International Summit",
    price: "Coming soon",
    status: "ANNOUNCING_SOON",
    highlights: [
      "Intercontinental faculty program",
      "Hosted by ISADe & Indian Dentist Research & Review",
      "Hill-station setting in Kerala, India",
    ],
    whatsIncluded: [
      "Program details to be announced — visit IDESsummit.com for full agenda updates.",
    ],
    idealParticipant: [
      "Dental clinicians, researchers, and educators worldwide",
      "Members of ISADe and partner organizations",
      "Practitioners across the Indo-Pacific dental community",
    ],
    learningObjectives: [
      "Curriculum being finalised — full agenda to be released ahead of the summit.",
    ],
    sponsors: [
      { name: "ISADe", note: "International Society of Advanced Dentistry" },
      { name: "Indian Dentist Research & Review" },
    ],
    speaker: {
      name: "ISADe × Indian Dentist Research & Review",
      title: "Joint Host Organizations",
      specialty: "International Dental Education",
      org: "Faculty to be announced",
    },
  },
  {
    id: "sidhe_shenzhen_2026",
    slug: "shenzhen-international-dental-high-tech-2026",
    title: "Shenzhen International Dental High-Tech",
    subtitle: "SIDHE 2026 · Shenzhen, China",
    summary:
      "Three-day international dental high-tech summit co-hosted by SIDHE, ISADe, and FDILA in Shenzhen, China.",
    description:
      "A high-tech international dental summit convening clinicians and innovators in Shenzhen. Co-presented by Shenzhen International Dental High-Tech (SIDHE), the International Society of Advanced Dentistry (ISADe), and the Federación Dental Ibero Latino Americana (FDILA). More details coming soon.",
    date: "2026-12-09T00:00:00.000Z",
    endDate: "2026-12-11T00:00:00.000Z",
    dateLabel: "Dec 9–11, 2026",
    city: "Shenzhen",
    country: "China",
    venue: "Shenzhen — venue announcing soon",
    venueDetail:
      "Convention venue in Shenzhen, China. Specific facility and full agenda to be confirmed.",
    lat: 22.5431,
    lng: 114.0579,
    type: "INTERNATIONAL",
    capacity: 300,
    spotsRemaining: 300,
    ceCredits: 0,
    topic: "International Summit",
    price: "Coming soon",
    status: "ANNOUNCING_SOON",
    highlights: [
      "Tri-organizational hosting: SIDHE × ISADe × FDILA",
      "Dental innovation & high-tech focus",
      "Three days in Shenzhen, China",
    ],
    whatsIncluded: [
      "Program details to be announced — more information coming soon.",
    ],
    idealParticipant: [
      "Clinicians focused on dental technology and innovation",
      "Members of SIDHE, ISADe, and FDILA",
      "International continuing-education participants",
    ],
    learningObjectives: [
      "Curriculum being finalised — more details coming soon.",
    ],
    sponsors: [
      { name: "SIDHE", note: "Shenzhen International Dental High-Tech" },
      { name: "ISADe", note: "International Society of Advanced Dentistry" },
      { name: "FDILA", note: "Federación Dental Ibero Latino Americana" },
    ],
    speaker: {
      name: "SIDHE × ISADe × FDILA",
      title: "Joint Host Organizations",
      specialty: "International Dental Education",
      org: "Faculty to be announced",
    },
  },
] as const;

export const FLAGSHIP_COURSE: Course = EVENTS[0]!;

export function findEvent(idOrSlug: string): Course | undefined {
  return EVENTS.find((e) => e.id === idOrSlug || e.slug === idOrSlug);
}

export function eventsByRegion(region?: EventTypeValue): readonly Course[] {
  if (!region) return EVENTS;
  return EVENTS.filter((e) => e.type === region);
}

/**
 * Render-ready CE-credits label. Courses with a published credit count
 * (e.g. flagship Veracruz: 35) render as "35 CE credits". Courses where the
 * accreditation is still being finalised (ceCredits === 0) render as
 * "CE TBA" so we never display "0 CE credits" anywhere.
 */
export function ceLabel(
  course: Pick<Course, "ceCredits">,
  format: "full" | "short" | "value" = "full",
): string {
  if (course.ceCredits <= 0) {
    return format === "value" ? "TBA" : "CE TBA";
  }
  if (format === "short") return `${course.ceCredits} CE`;
  if (format === "value") return `${course.ceCredits} credits`;
  return `${course.ceCredits} CE credits`;
}
