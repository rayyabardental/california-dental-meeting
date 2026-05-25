"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  GraduationCap,
  MapPin,
  Tag,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { EarlyRegistrationBanner } from "@/components/sections/early-registration-banner";
import { FlagshipCourse } from "@/components/sections/flagship-course";
import { Curriculum } from "@/components/sections/curriculum";
import { Included } from "@/components/sections/included";
import { RegistrationModal } from "@/components/shared/registration-modal";
import type { Course } from "@/lib/events-data";

/**
 * Course detail page — single template used by every course's
 * `/courses/[slug]` route. Composes the existing course sections and owns
 * the single shared RegistrationModal instance for the page.
 */
export function CourseDetail({
  course,
}: {
  course: Course;
}): React.ReactElement {
  const [registering, setRegistering] = useState(false);
  const openRegister = (): void => setRegistering(true);
  const closeRegister = (): void => setRegistering(false);

  return (
    <>
      <EarlyRegistrationBanner course={course} onRegister={openRegister} />
      <FlagshipCourse course={course} onRegister={openRegister} />
      <Curriculum course={course} />
      <Included course={course} />
      <BottomRegisterCta course={course} onRegister={openRegister} />

      <RegistrationModal
        event={registering ? course : null}
        onClose={closeRegister}
      />
    </>
  );
}

/**
 * Prominent register CTA pinned to the end of a course detail page. Mirrors
 * the brand band style (deep navy + gold accent) so it feels continuous
 * with the early-registration banner at the top.
 */
function BottomRegisterCta({
  course,
  onRegister,
}: {
  course: Course;
  onRegister: () => void;
}): React.ReactElement {
  const isOpen = course.status === "OPEN";
  const isAnnouncingSoon = course.status === "ANNOUNCING_SOON";
  const earlyActive =
    course.earlyRegistrationActive && course.earlyPrice && course.regularPrice;

  const ctaLabel = isOpen
    ? "Reserve your spot"
    : isAnnouncingSoon
      ? "Notify me when announced"
      : "Join the waitlist";

  return (
    <section
      aria-label={`Reserve a spot for ${course.title}`}
      className="relative isolate overflow-hidden bg-primary py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <Container size="wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <SectionEyebrow tone="gold" className="justify-center">
            Take the next step
          </SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-white md:text-5xl text-balance">
            {isAnnouncingSoon
              ? "Be the first to know."
              : `Reserve your seat for ${course.title}.`}
          </h2>
          <p className="mt-5 text-lg text-white/70 text-pretty">
            {isAnnouncingSoon
              ? "Curriculum and dates are being finalised. Join the waitlist and you'll be contacted directly as soon as the cohort opens for enrollment."
              : "Our enrollment coordinators will follow up within one business day with the full registration packet."}
          </p>

          <dl className="mt-10 grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            <CtaMeta
              icon={<Calendar className="h-4 w-4" />}
              label="Dates"
              value={course.dateLabel}
            />
            <CtaMeta
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={`${course.city}, ${course.country}`}
            />
            <CtaMeta
              icon={<GraduationCap className="h-4 w-4" />}
              label="CE Credits"
              value={`${course.ceCredits} credits`}
            />
            <CtaMeta
              icon={<Tag className="h-4 w-4" />}
              label="Tuition"
              value={
                earlyActive
                  ? `${course.earlyPrice} (early)`
                  : course.price
              }
            />
          </dl>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="gold"
              size="lg"
              onClick={onRegister}
              disabled={isAnnouncingSoon}
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="lg" href="/contact">
              Talk to enrollment
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function CtaMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="text-center sm:text-left">
      <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold sm:justify-start">
        <span className="text-gold">{icon}</span>
        {label}
      </p>
      <p className="mt-1.5 font-display text-base font-medium text-white">
        {value}
      </p>
    </div>
  );
}
