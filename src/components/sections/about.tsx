"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  GraduationCap,
  Globe2,
  HeartPulse,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { CountUp } from "@/components/ui/count-up";
import { CdmLogo } from "@/components/ui/cdm-logo";
import { FLAGSHIP_COURSE } from "@/lib/events-data";

const ORGANISATIONAL_GOALS: ReadonlyArray<string> = [
  "Deliver accessible continuing dental education to practitioners worldwide.",
  "Advance evidence-based dentistry and uphold scientific integrity.",
  "Support lifelong learning and ongoing professional development.",
  "Maintain full compliance with AGD PACE Standards and Criteria.",
  "Build educational partnerships with recognised academic institutions and organisations.",
  "Champion safe, ethical patient care across every programme.",
];

const EDUCATIONAL_GOALS: ReadonlyArray<string> = [
  "Strengthen clinical knowledge and procedural skills of dental professionals.",
  "Provide hands-on training in modern, evidence-led dental procedures.",
  "Deepen understanding of current scientific literature and treatment protocols.",
  "Encourage the adoption of evidence-based techniques in daily practice.",
  "Foster interdisciplinary collaboration and meaningful professional networking.",
];

const PILLARS: ReadonlyArray<{
  icon: React.ReactNode;
  title: string;
  body: string;
}> = [
  {
    icon: <HeartPulse className="h-5 w-5" />,
    title: "Live patient surgery",
    body: "Not a model lab. Participants place 15–20 implants on real patients under direct faculty supervision throughout the week.",
  },
  {
    icon: <GraduationCap className="h-5 w-5" />,
    title: "Accredited continuing education",
    body: "35 CE credits earned across seven days of structured theory, hands-on workshops, and supervised clinical practice.",
  },
  {
    icon: <Globe2 className="h-5 w-5" />,
    title: "International faculty",
    body: "Founded and directed by Dr. Wilmer Yabar. Course Director Dr. Jaime Franco leads the Veracruz programme in partnership with Universidad CEYESOV.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Team-based workflow",
    body: "Participants rotate through four clinical roles, building both surgical competence and modern surgical-team fluency.",
  },
];

export function About(): React.ReactElement {
  return (
    <section
      id="about"
      aria-label="About California Dental Meeting"
      className="relative bg-surface py-24 lg:py-32"
    >
      <Container size="wide">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <SectionEyebrow tone="primary">About CDM</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
              International education. Clinical excellence. Innovation.
            </h2>
            <p className="mt-5 text-lg text-ink-muted text-pretty">
              California Dental Meeting is an international continuing-
              education organisation. CDM partners with leading academic
              institutions to deliver structured, immersive programmes built
              around supervised live-patient surgery — not lectures, not
              models alone.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-primary/10 py-8">
              <Stat
                label="CE credits per cohort"
                value={<CountUp to={35} />}
              />
              <Stat
                label="Implants placed each"
                value={
                  <>
                    15&ndash;
                    <CountUp to={20} />
                  </>
                }
              />
              <Stat
                label="Days on site"
                value={<CountUp to={7} />}
              />
              <Stat
                label="Continents represented"
                value={<CountUp to={3} />}
              />
            </div>
          </div>

          <div className="space-y-12">
            <div className="grid gap-4 sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="rounded-3xl border border-primary/8 bg-white p-6 shadow-[0_1px_2px_rgba(13,35,64,0.04)]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                    {p.icon}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-medium text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
                    {p.body}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Course Director feature */}
            <div className="overflow-hidden rounded-3xl border border-primary/10 bg-primary text-white shadow-[0_20px_50px_-30px_rgba(13,35,64,0.55)]">
              <div className="grid gap-0 sm:grid-cols-[10rem_1fr]">
                <div className="flex items-center justify-center bg-primary-600 p-8">
                  <CdmLogo size={120} className="ring-white/30" />
                </div>
                <div className="p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                    Programme Director
                  </p>
                  <p className="mt-2 font-display text-2xl font-medium">
                    {FLAGSHIP_COURSE.speaker.name}
                  </p>
                  <p className="text-sm text-white/70">
                    {FLAGSHIP_COURSE.speaker.title} ·{" "}
                    {FLAGSHIP_COURSE.speaker.org}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/80 text-pretty">
                    {FLAGSHIP_COURSE.speaker.bio}
                  </p>
                </div>
              </div>
            </div>

            {/* University partner + sponsors */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-primary/10 bg-white p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
                  University Partner
                </p>
                <h3 className="mt-2 font-display text-xl font-medium text-primary">
                  Universidad CEYESOV
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-muted">
                  Veracruz, Mexico
                </p>
                <p className="mt-4 text-sm text-ink-muted text-pretty">
                  Modern clinical facilities, experienced faculty, and
                  supervised live-patient surgical cases. Clinically oriented
                  programmes in real patient care and advanced surgical
                  training.
                </p>
              </div>

              <div
                id="sponsors"
                className="rounded-3xl border border-primary/10 bg-white p-7"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                  Sponsors
                </p>
                <h3 className="mt-2 font-display text-xl font-medium text-primary">
                  Industry partners
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {FLAGSHIP_COURSE.sponsors?.map((s) => (
                    <li
                      key={s.name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-primary/8 bg-sand-100 px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium text-primary">
                        {s.name}
                      </span>
                      {s.note && (
                        <span className="text-xs text-ink-muted">
                          {s.note}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mission statement + organisational & educational goals */}
            <div id="mission" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary to-primary-700 p-8 text-white shadow-[0_20px_50px_-30px_rgba(13,35,64,0.55)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                  Mission Statement
                </p>
                <p className="mt-4 font-display text-xl leading-snug text-white text-balance sm:text-2xl">
                  California Dental Meeting Inc. delivers high-quality,
                  evidence-based continuing dental education that advances
                  professional growth, scientific rigour, clinical excellence,
                  patient safety, and ethical practice.
                </p>
              </motion.div>

              <div className="grid gap-6 sm:grid-cols-2">
                <GoalCard
                  eyebrow="Organisational Goals"
                  icon={<Target className="h-5 w-5" />}
                  items={ORGANISATIONAL_GOALS}
                />
                <GoalCard
                  eyebrow="Educational Goals"
                  icon={<BookOpen className="h-5 w-5" />}
                  items={EDUCATIONAL_GOALS}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function GoalCard({
  eyebrow,
  icon,
  items,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  items: ReadonlyArray<string>;
}): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-primary/10 bg-white p-7 shadow-[0_1px_2px_rgba(13,35,64,0.04)]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
          {icon}
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted text-pretty"
          >
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-medium text-primary">
        {value}
      </p>
    </div>
  );
}
