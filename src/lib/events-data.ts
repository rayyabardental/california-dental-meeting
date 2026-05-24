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
      "Seven-day immersive implantology programme with live patient surgery under direct faculty supervision at Universidad CEYESOV, Veracruz.",
    description:
      "An intensive, immersive implantology programme offering live patient surgery under direct faculty supervision at Universidad CEYESOV, Veracruz, Mexico. Participants complete real surgical cases alongside peers, building confidence and clinical mastery in modern implant dentistry within a structured, team-based educational environment.",
    date: "2026-08-30T00:00:00.000Z",
    endDate: "2026-09-05T00:00:00.000Z",
    dateLabel: "Aug 30 – Sep 5, 2026",
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
      "Surgical scrubs & caps (2 sets)",
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
      title: "Program Director",
      specialty: "Implantology",
      org: "California Dental Meeting",
      bio: "Program Director of California Dental Meeting, leading the live-patient surgical curriculum in partnership with Universidad CEYESOV. Dr. Franco directs all clinical sessions, oversees treatment planning, and supervises every implant placement performed during the programme.",
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
              "Welcome meeting — introductions, materials distribution (backpacks, scrubs, caps), programme overview, clinical team organization",
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
    id: "cdm_advanced_spring_2027",
    slug: "advanced-implant-prosthodontics-spring-2027",
    title: "Advanced Implant Prosthodontics",
    subtitle: "Full-Arch Restoration · Digital Workflows",
    summary:
      "Continuation programme for graduates of the basic course: prosthetic phase, occlusion, and digital workflows.",
    description:
      "Next-step continuing-education programme building on the foundations of the Veracruz basic course. Curriculum and dates are being finalised with the academic partner — join the waitlist to receive details first.",
    date: "2027-04-12T00:00:00.000Z",
    dateLabel: "Spring 2027 · Dates TBA",
    city: "Veracruz",
    country: "Mexico",
    venue: "Universidad CEYESOV",
    venueDetail:
      "Curriculum partner Universidad CEYESOV. Specific facility and full agenda to be confirmed.",
    lat: 19.1738,
    lng: -96.1342,
    type: "INTERNATIONAL",
    capacity: 20,
    spotsRemaining: 20,
    ceCredits: 30,
    topic: "Prosthodontics · Digital Workflows",
    price: "Announcing soon",
    status: "ANNOUNCING_SOON",
    highlights: [
      "Full-arch restoration protocols",
      "Digital workflow integration",
      "Restorative phase of CDM implant cases",
    ],
    whatsIncluded: ["Programme details to be announced"],
    idealParticipant: [
      "Graduates of the CDM Basic Dental Implant Course",
      "Clinicians experienced in implant placement",
    ],
    learningObjectives: ["Curriculum being finalised — join the waitlist"],
    speaker: {
      name: "Dr. Jaime Franco",
      title: "Program Director",
      specialty: "Implantology",
      org: "California Dental Meeting",
    },
  },
  {
    id: "cdm_california_symposium_2027",
    slug: "california-clinical-symposium-2027",
    title: "California Clinical Symposium",
    subtitle: "CDM Members & Alumni Gathering",
    summary:
      "Inaugural California-hosted symposium for CDM alumni and members — clinical case review, faculty roundtables, and continuing education.",
    description:
      "California-hosted symposium for CDM alumni, members, and visiting international faculty. Venue and full agenda to be announced.",
    date: "2027-06-15T00:00:00.000Z",
    dateLabel: "Summer 2027 · Dates TBA",
    city: "Southern California",
    country: "United States",
    venue: "Venue to be announced",
    venueDetail: "Southern California venue in finalisation.",
    lat: 33.9806,
    lng: -117.3755,
    type: "CALIFORNIA",
    capacity: 120,
    spotsRemaining: 120,
    ceCredits: 12,
    topic: "Clinical Symposium",
    price: "Announcing soon",
    status: "ANNOUNCING_SOON",
    highlights: [
      "CDM alumni & member gathering",
      "Visiting international faculty",
      "Clinical case review tracks",
    ],
    whatsIncluded: ["Details to be announced"],
    idealParticipant: [
      "CDM members and alumni",
      "California dental community",
    ],
    learningObjectives: ["Curriculum being finalised"],
    speaker: {
      name: "Dr. Jaime Franco",
      title: "Program Director",
      specialty: "Implantology",
      org: "California Dental Meeting",
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
