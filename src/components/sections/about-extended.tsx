"use client";

import { motion } from "framer-motion";
import {
  Award,
  Building2,
  GraduationCap,
  Globe2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

const TEAM: ReadonlyArray<{
  name: string;
  role: string;
  detail: string;
  initials: string;
}> = [
  {
    name: "Dr. Jaime Franco",
    role: "Founder & Programme Director",
    detail:
      "International implantology educator. Founder of California Dental Meeting and lead surgical mentor for the Veracruz cohort.",
    initials: "JF",
  },
  {
    name: "Ray Buelna",
    role: "Enrollment & Logistics",
    detail:
      "Coordinates participant onboarding, travel, and accommodation across the seven-day Veracruz programme.",
    initials: "RB",
  },
  {
    name: "Jacky Sanchez",
    role: "Enrollment Coordinator",
    detail:
      "First point of contact for prospective participants. Handles registration, documentation, and pre-course communication.",
    initials: "JS",
  },
  {
    name: "Clinical Faculty",
    role: "Universidad CEYESOV",
    detail:
      "Resident surgical faculty providing chairside supervision throughout the live-patient clinical days.",
    initials: "CF",
  },
];

const CREDENTIALS: ReadonlyArray<{
  icon: React.ReactNode;
  title: string;
  body: string;
}> = [
  {
    icon: <GraduationCap className="h-5 w-5" />,
    title: "35 CE credits per cohort",
    body: "Each Veracruz programme delivers 35 continuing-education credits across theory, hands-on workshops, and supervised live surgery.",
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: "Academic partnership accreditation",
    body: "Programme certificates are issued in partnership with Universidad CEYESOV — one of Mexico's premier dental education institutions.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Supervised live-patient training",
    body: "Every implant placement is performed under direct supervision of credentialed surgical faculty in a clinical environment.",
  },
  {
    icon: <Stethoscope className="h-5 w-5" />,
    title: "Team-based surgical workflow",
    body: "Participants rotate through four clinical roles, mirroring the structure of a modern surgical-implant practice.",
  },
];

const PARTNERSHIPS: ReadonlyArray<{
  name: string;
  region: string;
  description: string;
}> = [
  {
    name: "Universidad CEYESOV",
    region: "Veracruz, Mexico",
    description:
      "Academic host of the flagship Veracruz programme. Provides clinical facilities, resident faculty, and patient cases.",
  },
  {
    name: "ISADe USA",
    region: "United States",
    description:
      "Industry sponsor — surgical materials and implant systems supplied across the live-patient clinical days.",
  },
  {
    name: "FDILA",
    region: "Latin America",
    description:
      "Latin-American dental implant association partner — supports cross-border continuing education and clinical exchange.",
  },
  {
    name: "IDII",
    region: "International",
    description:
      "Innovating Dental Implant Institute — collaborator on curriculum design and ongoing professional development pathways.",
  },
];

export function AboutExtended(): React.ReactElement {
  return (
    <>
      {/* Team */}
      <section
        id="team"
        aria-label="CDM team"
        className="relative bg-surface-dark py-24 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
        <Container size="wide">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow tone="gold" className="justify-center">
              Our Team
            </SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-white md:text-5xl text-balance">
              The people behind every Veracruz cohort.
            </h2>
            <p className="mt-5 text-base text-white/70 text-pretty">
              A small, focused team combining international clinical
              leadership with hands-on enrollment and logistics support.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m, i) => (
              <motion.article
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-500 font-display text-base font-semibold text-primary">
                  {m.initials}
                </span>
                <h3 className="mt-5 font-display text-lg font-medium text-white">
                  {m.name}
                </h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  {m.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/65 text-pretty">
                  {m.detail}
                </p>
              </motion.article>
            ))}
          </div>

          <p className="mt-10 text-center text-xs uppercase tracking-[0.22em] text-white/40">
            Faculty roster expands each cohort — full credentials provided to enrolled participants.
          </p>
        </Container>
      </section>

      {/* Credentials */}
      <section
        id="credentials"
        aria-label="Credentials"
        className="relative bg-surface py-24 lg:py-32"
      >
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <SectionEyebrow tone="primary">Credentials</SectionEyebrow>
              <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
                Structured. Accredited. Clinically rigorous.
              </h2>
              <p className="mt-5 text-base text-ink-muted text-pretty">
                CDM programmes are built on the academic infrastructure of a
                partner university. Every participant earns a certificate of
                completion alongside the continuing-education credit hours
                their licensure body recognises.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {CREDENTIALS.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="rounded-3xl border border-primary/10 bg-white p-6"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                    {c.icon}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-medium text-primary">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
                    {c.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* International partnerships */}
      <section
        id="partnerships"
        aria-label="International partnerships"
        className="relative bg-sand-100 py-24 lg:py-32"
      >
        <Container size="wide">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow tone="primary" className="justify-center">
              International Partnerships
            </SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
              A network spanning three continents.
            </h2>
            <p className="mt-5 text-base text-ink-muted text-pretty">
              Universities, industry sponsors, and clinical associations
              collaborating to make immersive, supervised live-patient
              implant training accessible to dentists worldwide.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {PARTNERSHIPS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex items-start gap-5 rounded-3xl border border-primary/10 bg-white p-6"
              >
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-primary/5 text-primary">
                  {p.name === "Universidad CEYESOV" ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <Globe2 className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
                    {p.region}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-medium text-primary">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
                    {p.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
