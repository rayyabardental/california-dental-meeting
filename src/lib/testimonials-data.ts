export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  specialty: string;
  city: string;
  initials: string;
  accent: "primary" | "accent" | "gold";
};

// Placeholder testimonials — replace with real CDM alumni quotes when collected.
// Per brief: placeholder text only where real content is genuinely unavailable.
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "t1",
    quote:
      "Placing live implants under supervision changed everything. I returned to my practice with hands that knew the procedure — not slides that described it.",
    author: "Dr. A. Reyes",
    specialty: "General Dentistry",
    city: "Southern California",
    initials: "AR",
    accent: "accent",
  },
  {
    id: "t2",
    quote:
      "The team-based workflow at Universidad CEYESOV is the closest thing to a residency rotation I've experienced as a continuing-education attendee.",
    author: "Dr. M. Okafor",
    specialty: "Implantology",
    city: "Houston, TX",
    initials: "MO",
    accent: "gold",
  },
  {
    id: "t3",
    quote:
      "Dr. Franco's direct supervision and the international cohort were the difference. I came home with 18 implants placed and the confidence to grow my implant practice.",
    author: "Dr. J. Park",
    specialty: "General Dentistry",
    city: "Vancouver, BC",
    initials: "JP",
    accent: "primary",
  },
  {
    id: "t4",
    quote:
      "Seven days. Six clinical sessions. Every hour structured. The closing graduation dinner felt earned in a way most CE rarely does.",
    author: "Dr. M. Hayashi",
    specialty: "Implantology",
    city: "São Paulo, Brazil",
    initials: "MH",
    accent: "accent",
  },
];
