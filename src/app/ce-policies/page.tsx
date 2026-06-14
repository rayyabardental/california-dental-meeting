import type { Metadata } from "next";
import {
  Accessibility,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  Check,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

export const metadata: Metadata = {
  title: "CE Policies",
  description:
    "California Dental Meeting continuing-education policies: CE credit, attendance, faculty disclosure, commercial support, grievances, accessibility, and refunds.",
};

const OBJECTIVE_GROUPS: ReadonlyArray<{
  title: string;
  items: ReadonlyArray<string>;
}> = [
  {
    title: "Clinical Knowledge",
    items: [
      "Evaluate current concepts and emerging trends in dentistry.",
      "Analyze scientific evidence relevant to clinical decision-making.",
      "Integrate contemporary treatment approaches into clinical practice.",
      "Identify risk factors that influence treatment outcomes.",
    ],
  },
  {
    title: "Clinical Skills",
    items: [
      "Improve diagnostic and treatment planning capabilities.",
      "Apply evidence-based protocols to patient care.",
      "Enhance interdisciplinary communication and case management.",
      "Recognize and manage clinical complications more effectively.",
    ],
  },
  {
    title: "Professional Development",
    items: [
      "Strengthen ethical and professional decision-making.",
      "Improve patient communication and education strategies.",
      "Enhance leadership and practice management skills.",
      "Promote lifelong learning and professional growth.",
    ],
  },
];

const AUDIENCE: ReadonlyArray<string> = [
  "General dentists",
  "Dental specialists",
  "Dental hygienists",
  "Registered dental assistants",
  "Dental laboratory technicians",
  "Dental students and residents",
];

type Policy = {
  icon: React.ReactNode;
  title: string;
  bullets?: ReadonlyArray<string>;
  paragraphs: ReadonlyArray<string>;
};

const POLICIES: ReadonlyArray<Policy> = [
  {
    icon: <ClipboardCheck className="h-5 w-5" />,
    title: "Attendance Policy",
    bullets: [
      "Complete registration procedures.",
      "Attend the educational activity in its entirety.",
      "Comply with attendance verification procedures.",
      "Complete required course evaluation forms.",
    ],
    paragraphs: [
      "Certificates of completion will be issued only after attendance has been verified.",
    ],
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Faculty Disclosure Policy",
    paragraphs: [
      "California Dental Meeting requires all speakers, instructors, planners, and content reviewers to disclose any relevant financial relationships that could create a conflict of interest.",
      "All disclosures are reviewed prior to the educational activity and communicated to participants when appropriate.",
    ],
  },
  {
    icon: <Scale className="h-5 w-5" />,
    title: "Commercial Support Policy",
    paragraphs: [
      "California Dental Meeting is committed to maintaining the independence, objectivity, and scientific integrity of its educational programs.",
      "Any commercial support received will be disclosed to participants in accordance with applicable continuing-education standards and regulations.",
      "Commercial supporters shall have no influence over educational content, faculty selection, or learning objectives.",
    ],
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Grievance & Complaint Resolution",
    paragraphs: [
      "Participants may submit complaints regarding course administration, educational quality, facilities, faculty performance, attendance verification, or continuing-education documentation.",
      "Complaints may be sent to California Dental Meeting (CDM) at ray.yabardental@gmail.com and will be reviewed and addressed in a timely and professional manner.",
    ],
  },
  {
    icon: <Accessibility className="h-5 w-5" />,
    title: "Accessibility Statement",
    paragraphs: [
      "California Dental Meeting is committed to providing accessible educational opportunities to all participants.",
      "Individuals requiring reasonable accommodations should notify the meeting organizers in advance of the event.",
    ],
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: "Refund & Cancellation Policy",
    paragraphs: [
      "Refund requests must be submitted in writing prior to the scheduled event date.",
      "Refund eligibility, deadlines, and processing procedures will be provided during registration.",
    ],
  },
];

export default function CePoliciesPage(): React.ReactElement {
  return (
    <>
      {/* Header */}
      <section className="relative isolate overflow-hidden bg-primary py-20 text-white lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow tone="gold" className="justify-center">
              Continuing Education
            </SectionEyebrow>
            <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl text-balance">
              CE Policies
            </h1>
            <p className="mt-5 text-lg text-white/75 text-pretty">
              The educational objectives, credit requirements, and
              participant policies that govern California Dental Meeting
              continuing-education programs.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-gold/30 bg-white/[0.04] p-7 backdrop-blur-md sm:p-8">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              <GraduationCap className="h-4 w-4" />
              Continuing Education Credit
            </p>
            <p className="mt-3 font-display text-2xl font-medium text-balance">
              7 hours of Continuing Education Credit
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/75 text-pretty">
              Participants who successfully complete the attendance
              requirements will receive 7 hours of CE credit. Credits are
              awarded based on verified participation and compliance with
              attendance and evaluation requirements.
            </p>
          </div>
        </Container>
      </section>

      {/* Educational objectives */}
      <section className="relative bg-surface py-24 lg:py-32">
        <Container size="wide">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow tone="primary" className="justify-center">
              Educational Objectives
            </SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
              What participants will be able to do.
            </h2>
            <p className="mt-5 text-lg text-ink-muted text-pretty">
              Participants attending California Dental Meeting educational
              programs will be able to:
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {OBJECTIVE_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-3xl border border-primary/10 bg-white p-7 shadow-[0_1px_2px_rgba(13,35,64,0.04)]"
              >
                <h3 className="font-display text-xl font-medium text-primary">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-ink"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
                      <span className="text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Intended audience */}
          <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-primary/10 bg-sand-100 p-7 sm:p-8">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
              <Users className="h-4 w-4" />
              Intended Audience
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {AUDIENCE.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-primary/12 bg-white px-3.5 py-1.5 text-sm font-medium text-primary"
                >
                  {a}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Participation is subject to applicable state regulations and
              scope-of-practice requirements.
            </p>
          </div>
        </Container>
      </section>

      {/* Policies */}
      <section className="relative bg-sand-100 py-24 lg:py-32">
        <Container size="wide">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow tone="gold" className="justify-center">
              Participant Policies
            </SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
              Standards we hold every program to.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {POLICIES.map((p) => (
              <div
                key={p.title}
                className="rounded-3xl border border-primary/10 bg-white p-7"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                  {p.icon}
                </span>
                <h3 className="mt-5 font-display text-xl font-medium text-primary">
                  {p.title}
                </h3>
                {p.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-sm text-ink"
                      >
                        <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
                        <span className="text-pretty">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-3">
                  {p.paragraphs.map((para) => (
                    <p
                      key={para}
                      className="text-sm leading-relaxed text-ink-muted text-pretty"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Organizers */}
      <section className="relative bg-surface py-24 lg:py-32">
        <Container size="wide">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow tone="primary" className="justify-center">
              About the Organizers
            </SectionEyebrow>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-primary/10 bg-white p-7 sm:p-8">
              <h3 className="font-display text-xl font-medium text-primary">
                California Dental Meeting (CDM)
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty">
                A continuing dental education organization dedicated to
                advancing clinical excellence through evidence-based education,
                scientific meetings, and professional development
                opportunities.
              </p>
            </div>
            <div className="rounded-3xl border border-primary/10 bg-white p-7 sm:p-8">
              <h3 className="font-display text-xl font-medium text-primary">
                ISADe — International Society of Advanced Dentistry
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty">
                An international professional organization dedicated to
                advancing dental education, scientific research, professional
                collaboration, and the global exchange of knowledge among oral
                healthcare professionals.
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">
                Shaping the Future of Global Dentistry.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
