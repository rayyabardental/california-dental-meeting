"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  GraduationCap,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { EVENTS, type Course } from "@/lib/events-data";
import { RegistrationModal } from "@/components/shared/registration-modal";
import { cn } from "@/lib/utils";

export function Courses(): React.ReactElement {
  const [registering, setRegistering] = useState<Course | null>(null);

  return (
    <section
      id="courses"
      aria-label="All Courses"
      className="relative bg-sand-100 py-24 lg:py-32"
    >
      <Container size="wide">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow tone="accent">Course catalog</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
              All California Dental Meeting programmes.
            </h2>
            <p className="mt-5 text-lg text-ink-muted text-pretty">
              The 2026 flagship in Veracruz plus follow-on programmes
              currently being scheduled with our academic partners.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {EVENTS.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              index={idx}
              onRegister={() => setRegistering(course)}
            />
          ))}
        </div>
      </Container>

      <RegistrationModal
        event={registering}
        onClose={() => setRegistering(null)}
      />
    </section>
  );
}

function CourseCard({
  course,
  index,
  onRegister,
}: {
  course: Course;
  index: number;
  onRegister: () => void;
}): React.ReactElement {
  const isOpen = course.status === "OPEN";
  const isFlagship = course.id === "cdm_veracruz_2026";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.18) }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_1px_2px_rgba(13,35,64,0.04)] transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(13,35,64,0.25)]",
        isFlagship ? "border-gold/60 ring-2 ring-gold/30" : "border-primary/8",
      )}
    >
      {isFlagship && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Flagship
        </div>
      )}

      <CourseCardHeader course={course} />

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
          {course.topic}
        </p>
        <h3 className="mt-2 font-display text-xl font-medium leading-snug text-primary text-balance">
          {course.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm text-ink-muted text-pretty">
          {course.summary}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Row icon={<Calendar className="h-3.5 w-3.5" />} label={course.dateLabel} />
          <Row
            icon={<MapPin className="h-3.5 w-3.5" />}
            label={`${course.city}, ${course.country}`}
          />
          <Row
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label={`${course.ceCredits} CE credits`}
          />
          <Row icon={<Tag className="h-3.5 w-3.5" />} label={course.price} />
        </dl>

        <div className="mt-5 border-t border-primary/8 pt-4 text-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Instructor
          </p>
          <p className="mt-1 font-medium text-primary">{course.speaker.name}</p>
          <p className="text-xs text-ink-muted">
            {course.speaker.title} · {course.speaker.org}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-600">
              <Users className="h-3.5 w-3.5" />
              {course.spotsRemaining} of {course.capacity} seats left
            </span>
          ) : (
            <span className="text-xs font-medium text-ink-muted">
              {course.status === "ANNOUNCING_SOON"
                ? "Announcing soon"
                : "Waitlist open"}
            </span>
          )}

          <Button variant="primary" size="sm" onClick={onRegister}>
            {isOpen ? "Register" : "Join waitlist"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function Row({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2 text-ink-muted">
      <span className="text-accent">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function CourseCardHeader({ course }: { course: Course }): React.ReactElement {
  const palettes: Record<Course["type"], string> = {
    CALIFORNIA: "from-ocean-400 via-accent to-primary",
    NATIONAL: "from-gold via-gold-500 to-primary",
    INTERNATIONAL: "sunset-gradient",
  };
  const gradientClass =
    course.type === "INTERNATIONAL"
      ? "sunset-gradient"
      : `bg-gradient-to-br ${palettes[course.type]}`;
  return (
    <div className={cn("relative h-32 w-full overflow-hidden", gradientClass)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
      <div className="relative flex h-full items-end justify-between p-5 text-white">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
            {course.country}
          </p>
          <p className="mt-1 font-display text-xl font-medium leading-none">
            {course.dateLabel.split("·")[0]?.trim() ?? course.dateLabel}
          </p>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
          {course.ceCredits} CE
        </p>
      </div>
    </div>
  );
}
