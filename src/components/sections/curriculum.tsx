"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Plane,
  BookOpen,
  Activity,
  Award,
  Sun,
  CalendarClock,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import type { Course, ScheduleDay, ScheduleIconKey } from "@/lib/events-data";

const ICON_MAP: Record<ScheduleIconKey, React.ReactNode> = {
  plane: <Plane className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />,
  award: <Award className="h-4 w-4" />,
  sun: <Sun className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
};

/**
 * Per-course schedule + learning objectives + ideal participant. Reusable
 * across every course detail page; gracefully degrades to a "to be
 * announced" panel when a course has no published schedule yet.
 */
export function Curriculum({ course }: { course: Course }): React.ReactElement {
  const schedule = course.schedule;
  const hasObjectives = course.learningObjectives.length > 0;
  const hasIdeal = course.idealParticipant.length > 0;
  const bothPanels = hasObjectives && hasIdeal;

  return (
    <section
      id="curriculum"
      aria-label={`${course.title} — curriculum and schedule`}
      className="relative bg-surface py-24 lg:py-32"
    >
      <Container size="wide">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow tone="primary" className="justify-center">
            {!schedule || schedule.length === 0
              ? "Curriculum"
              : schedule.length === 1
                ? "Program Schedule"
                : "Daily Schedule"}
          </SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
            {!schedule || schedule.length === 0
              ? "Curriculum being finalised."
              : schedule.length === 1
                ? `A full day. ${course.ceCredits} CE credits.`
                : `${schedule.length} days. ${course.ceCredits} CE credits.`}
          </h2>
          <p className="mt-5 text-lg text-ink-muted text-pretty">
            {!schedule || schedule.length === 0
              ? `Detailed agenda for ${course.title} will be published as the cohort approaches. Join the waitlist to receive the full curriculum once confirmed.`
              : schedule.length === 1
                ? `The full agenda for ${course.title}.`
                : `The full agenda for the ${course.title} at ${course.venue}, ${course.city}.`}
          </p>
        </div>

        {schedule && schedule.length > 0 ? (
          <ol className="mx-auto mt-14 max-w-4xl space-y-4">
            {schedule.map((day, idx) => (
              <ScheduleDayCard key={day.date} day={day} index={idx} />
            ))}
          </ol>
        ) : (
          <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-[0_1px_2px_rgba(13,35,64,0.04)]">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
              <CalendarClock className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-xl font-medium text-primary">
              Detailed agenda to be announced
            </h3>
            <p className="mt-2 text-sm text-ink-muted text-pretty">
              {course.description}
            </p>
          </div>
        )}

        {(hasObjectives || hasIdeal) && (
          <div
            className={`mx-auto mt-20 grid gap-8 ${
              bothPanels ? "max-w-5xl lg:grid-cols-2" : "max-w-2xl"
            }`}
          >
            {hasObjectives && (
              <ListPanel
                eyebrow="Learning Objectives"
                heading="What you'll walk away knowing how to do."
                items={course.learningObjectives}
                tone="accent"
              />
            )}
            {hasIdeal && (
              <ListPanel
                eyebrow="Ideal Participant"
                heading="Designed for these clinicians."
                items={course.idealParticipant}
                tone="gold"
              />
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

function ScheduleDayCard({
  day,
  index,
}: {
  day: ScheduleDay;
  index: number;
}): React.ReactElement {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
      className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_1px_2px_rgba(13,35,64,0.04)]"
    >
      <div className="grid gap-0 lg:grid-cols-[14rem_1fr]">
        <div className="border-b border-primary/8 bg-sand-100 p-6 lg:border-b-0 lg:border-r">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {ICON_MAP[day.icon]}
            Day {index + 1}
          </span>
          <p className="mt-3 font-display text-2xl font-medium text-primary">
            {day.date}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{day.weekday}</p>
          <p className="mt-4 text-sm font-medium text-accent-600">
            {day.title}
          </p>
        </div>

        <ul className="divide-y divide-primary/8">
          {day.blocks.map((b, i) => (
            <li
              key={`${day.date}-${i}`}
              className="grid gap-2 px-6 py-4 sm:grid-cols-[8rem_1fr] sm:items-start sm:gap-4"
            >
              <p className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-primary">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {b.time}
              </p>
              <div>
                <p className="text-sm text-ink text-pretty">{b.activity}</p>
                {b.note && (
                  <p className="mt-1 text-xs italic text-ink-muted">
                    {b.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}

function ListPanel({
  eyebrow,
  heading,
  items,
  tone,
}: {
  eyebrow: string;
  heading: string;
  items: ReadonlyArray<string>;
  tone: "accent" | "gold";
}): React.ReactElement {
  const dot =
    tone === "accent"
      ? "bg-accent text-white"
      : "bg-gold text-primary";
  return (
    <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-[0_1px_2px_rgba(13,35,64,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-2xl font-medium text-primary text-balance">
        {heading}
      </h3>
      <ul className="mt-6 space-y-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-3 text-sm text-ink">
            <span
              className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-[10px] font-bold ${dot}`}
            >
              {i + 1}
            </span>
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
