"use client";

import { motion } from "framer-motion";
import { Clock, Plane, BookOpen, Activity, Award, Sun } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { FLAGSHIP_COURSE } from "@/lib/events-data";

type ScheduleDay = {
  date: string;
  weekday: string;
  title: string;
  icon: React.ReactNode;
  blocks: ReadonlyArray<{ time: string; activity: string; note?: string }>;
};

const SCHEDULE: ReadonlyArray<ScheduleDay> = [
  {
    date: "Sun, Aug 30",
    weekday: "Sunday",
    title: "Arrival Day",
    icon: <Plane className="h-4 w-4" />,
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
    icon: <BookOpen className="h-4 w-4" />,
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
    icon: <Activity className="h-4 w-4" />,
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
        activity: "Clinical discussion: afternoon case review · surgical planning",
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
    icon: <Award className="h-4 w-4" />,
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
    icon: <Sun className="h-4 w-4" />,
    blocks: [
      {
        time: "All day",
        activity:
          "One-day Veracruz city tour — explore one of Mexico's most historic and beautiful coastal cities",
        note: "Optional · included",
      },
    ],
  },
];

export function Curriculum(): React.ReactElement {
  return (
    <section
      id="curriculum"
      aria-label="Course curriculum and schedule"
      className="relative bg-surface py-24 lg:py-32"
    >
      <Container size="wide">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow tone="primary" className="justify-center">
            Daily Schedule
          </SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
            Seven days. Six clinical sessions. One transformative week.
          </h2>
          <p className="mt-5 text-lg text-ink-muted text-pretty">
            The full agenda for the {FLAGSHIP_COURSE.title} at{" "}
            {FLAGSHIP_COURSE.venue}, {FLAGSHIP_COURSE.city}.
          </p>
        </div>

        <ol className="mx-auto mt-14 max-w-4xl space-y-4">
          {SCHEDULE.map((day, idx) => (
            <ScheduleDayCard key={day.date} day={day} index={idx} />
          ))}
        </ol>

        {/* Learning objectives + ideal participant */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-8 lg:grid-cols-2">
          <ListPanel
            eyebrow="Learning Objectives"
            heading="What you'll walk away knowing how to do."
            items={FLAGSHIP_COURSE.learningObjectives}
            tone="accent"
          />
          <ListPanel
            eyebrow="Ideal Participant"
            heading="Designed for these clinicians."
            items={FLAGSHIP_COURSE.idealParticipant}
            tone="gold"
          />
        </div>
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
            {day.icon}
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
