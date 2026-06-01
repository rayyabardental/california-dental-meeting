"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  GraduationCap,
  MapPin,
  Tag,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { EVENTS, ceLabel, type Course } from "@/lib/events-data";
import { isPurchasable } from "@/lib/checkout";
import { useEnroll } from "@/lib/cart-store";
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
              Our 2026 flagship live-patient programme in Veracruz, plus two
              international summits in partnership with ISADe — IDES 2026 in
              Kerala and SIDHE 2026 in Shenzhen. Open any card to view that
              course&apos;s full curriculum and logistics.
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

/**
 * Course summary card.
 *
 * Uses the "stretched-link" pattern: the title's <Link> projects an
 * absolutely-positioned `::before` pseudo-element across the entire card,
 * making the whole card body clickable. The Register button sits above
 * the overlay (`relative z-10`) so it remains independently clickable.
 *
 * Result: no nested interactive elements, the link is reachable by Tab,
 * the button is reachable by Tab, hover/focus states are obvious — and
 * the underlying HTML is `<article><h3><a>...<button>` which is valid.
 */
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
  const purchasable = isPurchasable(course);
  const enroll = useEnroll();
  const href = `/courses/${course.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.18) }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_1px_2px_rgba(13,35,64,0.04)]",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(13,35,64,0.28)] hover:border-accent/40",
        "focus-within:-translate-y-1 focus-within:shadow-[0_24px_48px_-24px_rgba(13,35,64,0.28)] focus-within:border-accent",
        isFlagship ? "border-gold/60 ring-2 ring-gold/30" : "border-primary/8",
      )}
    >
      {isFlagship && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Flagship
        </div>
      )}

      <CourseCardHeader course={course} />

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
          {course.topic}
        </p>
        <h3 className="mt-2 font-display text-xl font-medium leading-snug text-primary text-balance">
          {/*
            Stretched-link: the ::before pseudo extends across the whole
            card so the body is clickable. Native focus-visible ring is
            preserved on the <a> itself for keyboard users.
          */}
          <Link
            href={href}
            aria-label={`${course.title} — view course details`}
            className={cn(
              "outline-none transition-colors",
              "before:absolute before:inset-0 before:z-0 before:rounded-3xl before:content-['']",
              "hover:text-accent-700",
              "focus-visible:before:ring-2 focus-visible:before:ring-accent focus-visible:before:ring-offset-2 focus-visible:before:ring-offset-white",
            )}
          >
            {course.title}
          </Link>
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
            label={ceLabel(course)}
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
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
              isOpen
                ? "bg-accent/10 text-accent-700"
                : "bg-primary/8 text-ink-muted",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOpen ? "bg-accent" : "bg-ink-muted/60",
              )}
            />
            {isOpen
              ? "Enrolling now"
              : course.status === "ANNOUNCING_SOON"
                ? "Announcing soon"
                : "Waitlist open"}
          </span>

          {/*
            Register button is layered above the stretched-link overlay
            (`relative z-10`). Clicking it triggers onRegister(); the link
            click is suppressed because the button is on top.
          */}
          <Button
            variant="primary"
            size="sm"
            onClick={purchasable ? () => enroll(course) : onRegister}
            className="relative z-10"
          >
            {purchasable ? "Enroll" : isOpen ? "Register" : "Join waitlist"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/*
          Subtle "View details" affordance — purely visual indication that
          the card body is interactive. Hidden from assistive tech because
          the Link already announces the destination via aria-label.
        */}
        <p
          aria-hidden="true"
          className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          View course details
          <ArrowUpRight className="h-3 w-3" />
        </p>
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
          {ceLabel(course, "short")}
        </p>
      </div>
    </div>
  );
}
