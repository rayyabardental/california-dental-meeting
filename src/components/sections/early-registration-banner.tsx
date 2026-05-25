"use client";

import { motion } from "framer-motion";
import { Sparkles, TimerReset } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/events-data";

/**
 * Prominent early-registration callout shown above a course detail.
 * Renders `null` unless the course has `earlyRegistrationActive` set, so
 * dropping a flag in events-data.ts hides the banner everywhere.
 */
export function EarlyRegistrationBanner({
  course,
  onRegister,
}: {
  course: Course;
  onRegister?: () => void;
}): React.ReactElement | null {
  if (!course.earlyRegistrationActive || !course.earlyPrice || !course.regularPrice) {
    return null;
  }

  const regularNumeric = Number(course.regularPrice.replace(/[^0-9.]/g, ""));
  const earlyNumeric = Number(course.earlyPrice.replace(/[^0-9.]/g, ""));
  const savings = Number.isFinite(regularNumeric - earlyNumeric)
    ? regularNumeric - earlyNumeric
    : null;
  const savingsLabel =
    savings !== null && savings > 0
      ? `Save $${savings.toLocaleString("en-US")}`
      : null;

  return (
    <section
      aria-label="Early registration offer"
      className="relative isolate overflow-hidden bg-primary py-10 lg:py-12"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />

      <Container size="wide">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-6 rounded-3xl border border-gold/30 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8 lg:flex-row lg:items-center lg:gap-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Limited Early Registration
          </span>

          <div className="flex-1">
            <h2 className="font-display text-2xl font-medium leading-snug text-white sm:text-3xl">
              Reserve your seat at the early-registration rate.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
              Live patient surgery · {course.ceCredits} CE credits · Veracruz,
              Mexico. Early-registration pricing is available for a limited
              time while seats remain.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div className="text-left lg:text-right">
              <p className="flex items-baseline gap-3 leading-none">
                <span className="font-display text-4xl font-medium text-gold sm:text-5xl">
                  {course.earlyPrice}
                </span>
                <span className="text-base text-white/55 line-through decoration-white/40">
                  {course.regularPrice}
                </span>
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/90">
                <TimerReset className="h-3.5 w-3.5" />
                {savingsLabel ?? "Early rate"} · Enrolling now
              </p>
            </div>
            {onRegister ? (
              <Button variant="gold" size="lg" onClick={onRegister}>
                Reserve at {course.earlyPrice}
              </Button>
            ) : (
              <Button variant="gold" size="lg" href="#flagship">
                Reserve at {course.earlyPrice}
              </Button>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
