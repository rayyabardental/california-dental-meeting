"use client";

import { motion } from "framer-motion";
import { GraduationCap, Globe2, HeartPulse, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { CountUp } from "@/components/ui/count-up";
import { CdmLogo } from "@/components/ui/cdm-logo";
import { FLAGSHIP_COURSE } from "@/lib/events-data";

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
    body: "Course director Dr. Jaime Franco leads an international faculty in partnership with Universidad CEYESOV, Veracruz.",
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
          </div>
        </div>
      </Container>
    </section>
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
