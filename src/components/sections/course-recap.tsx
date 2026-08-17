"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, GraduationCap, Quote, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { CourseFaculty } from "@/components/sections/course-faculty";
import { Curriculum } from "@/components/sections/curriculum";
import { ceLabel, type Course } from "@/lib/events-data";

/**
 * Retrospective view for a concluded event. Replaces the registration layout
 * entirely — there is no enrollment, pricing, or payment anywhere here.
 */
export function CourseRecap({
  course,
}: {
  course: Course;
}): React.ReactElement {
  const recap = course.recap;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-primary py-20 text-white lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <Container size="wide">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Event concluded
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium tracking-tight md:text-5xl text-balance">
              {recap?.headline ?? course.title}
            </h1>
            <p className="mt-4 text-lg text-white/75 text-pretty">
              {course.title}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold" />
                {course.dateLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                {course.city}, {course.country}
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gold" />
                {ceLabel(course)}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Founder's message (bilingual) ────────────────────────────────── */}
      {recap && (
        <section className="relative bg-surface py-20 lg:py-28">
          <Container size="default">
            <div className="mx-auto max-w-3xl">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
                <Quote className="h-5 w-5" />
              </span>
              <blockquote className="mt-6 text-center">
                <p className="font-display text-xl leading-relaxed text-primary text-pretty md:text-2xl">
                  {recap.messageEn}
                </p>
                <p className="mt-6 text-base leading-relaxed text-ink-muted text-pretty">
                  {recap.messageEs}
                </p>
              </blockquote>
              <p className="mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
                {recap.messageAttribution}
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* ── Photo gallery ────────────────────────────────────────────────── */}
      {recap && recap.photos.length > 0 && (
        <section
          aria-label="Event photos"
          className="relative bg-sand-100 py-20 lg:py-28"
        >
          <Container size="wide">
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow tone="gold" className="justify-center">
                Moments from the day
              </SectionEyebrow>
              <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
                Highlights from the meeting.
              </h2>
            </div>

            <div className="mx-auto mt-14 max-w-5xl gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
              {recap.photos.map((photo, i) => (
                <motion.figure
                  key={photo.src}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.25) }}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-[0_1px_2px_rgba(13,35,64,0.05)]"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.w}
                    height={photo.h}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full"
                  />
                </motion.figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Speakers (retrospective) ─────────────────────────────────────── */}
      <CourseFaculty course={course} />

      {/* ── Program (retrospective) ──────────────────────────────────────── */}
      <Curriculum course={course} />

      {/* ── Certificate note ─────────────────────────────────────────────── */}
      {course.certificate && (
        <section className="relative bg-surface pb-24">
          <Container size="default">
            <div className="mx-auto max-w-2xl rounded-3xl border border-primary/10 bg-white p-7 text-center sm:p-8">
              <h2 className="font-display text-xl font-medium text-primary">
                Attended this course?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty">
                Certificates of Completion for verified attendees are issued
                after the event. If you signed at check-in, your official Dental
                Board of California certificate is on its way to your email.
              </p>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
