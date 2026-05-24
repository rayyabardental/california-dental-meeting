"use client";

import { motion } from "framer-motion";
import {
  Bed,
  Bus,
  Shirt,
  Stethoscope,
  Award,
  UtensilsCrossed,
  Backpack,
  BookOpen,
  Activity,
  GraduationCap,
  MapIcon,
  Camera,
  Laptop,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import type { Course } from "@/lib/events-data";

const INCLUDED_ICONS: ReadonlyArray<React.ReactNode> = [
  <Bed key="bed" className="h-5 w-5" />,
  <Bus key="bus" className="h-5 w-5" />,
  <Shirt key="shirt" className="h-5 w-5" />,
  <Stethoscope key="stetho" className="h-5 w-5" />,
  <Activity key="act" className="h-5 w-5" />,
  <UtensilsCrossed key="util" className="h-5 w-5" />,
  <Backpack key="bag" className="h-5 w-5" />,
  <BookOpen key="book" className="h-5 w-5" />,
  <Award key="award" className="h-5 w-5" />,
  <GraduationCap key="grad" className="h-5 w-5" />,
  <MapIcon key="map" className="h-5 w-5" />,
];

/** What's included + clinical-team breakdown. Reusable per course; the
 * clinical-team and final-presentation panels are only shown when the
 * course actually has clinicalTeam data populated. */
export function Included({ course }: { course: Course }): React.ReactElement {
  const hasClinicalTeam =
    Array.isArray(course.clinicalTeam) && course.clinicalTeam.length > 0;

  return (
    <section
      id="included"
      aria-label={`${course.title} — what's included`}
      className="relative bg-sand-100 py-24 lg:py-32"
    >
      <Container size="wide">
        <div
          className={
            hasClinicalTeam
              ? "grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-start"
              : "max-w-3xl"
          }
        >
          <div>
            <SectionEyebrow tone="gold">What&apos;s Included</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
              {hasClinicalTeam
                ? "Tuition covers everything from airport to graduation dinner."
                : "What's included in this programme."}
            </h2>
            <p className="mt-5 max-w-xl text-lg text-ink-muted text-pretty">
              {hasClinicalTeam
                ? `The ${course.title} is fully inclusive — hotel, transportation, scrubs, materials, daily lunch, and the closing graduation dinner are all part of the programme.`
                : "Full inclusions for this cohort are being finalised with the academic partner."}
            </p>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {course.whatsIncluded.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(i * 0.03, 0.2),
                  }}
                  className="flex items-start gap-3 rounded-2xl border border-primary/8 bg-white px-4 py-3 text-sm text-primary"
                >
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-accent/10 text-accent">
                    {INCLUDED_ICONS[i] ?? (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </span>
                  <span className="mt-1 text-pretty">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {hasClinicalTeam && (
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-[0_1px_2px_rgba(13,35,64,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
                  Clinical Team Structure
                </p>
                <h3 className="mt-2 font-display text-2xl font-medium text-primary">
                  Four roles. One surgical case.
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Participants rotate through every role across the week,
                  building both surgical competence and team-based workflow
                  fluency.
                </p>
                <ol className="mt-5 space-y-3">
                  {course.clinicalTeam?.map((role, i) => (
                    <li
                      key={role.role}
                      className="flex items-start gap-3 rounded-2xl border border-primary/8 bg-sand-100 px-4 py-3"
                    >
                      <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gold text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-primary">{role.role}</p>
                        <p className="text-xs text-ink-muted">
                          {role.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-3xl border border-primary/10 bg-primary p-7 text-white shadow-[0_1px_2px_rgba(13,35,64,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                  Final Case Presentation
                </p>
                <p className="mt-2 text-sm text-white/85 text-pretty">
                  Before certificate delivery, each team presents one completed
                  clinical case from the course. Please bring:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/85">
                  <li className="flex items-start gap-2">
                    <Camera className="mt-0.5 h-4 w-4 flex-none text-gold" />
                    Smartphone with high-quality camera{" "}
                    <span className="text-white/55">or</span> professional
                    camera with surgical flash
                  </li>
                  <li className="flex items-start gap-2">
                    <Laptop className="mt-0.5 h-4 w-4 flex-none text-gold" />
                    Laptop for case presentation
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
