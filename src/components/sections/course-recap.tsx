"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  GraduationCap,
  Quote,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { CourseFaculty } from "@/components/sections/course-faculty";
import { Curriculum } from "@/components/sections/curriculum";
import { ceLabel, type Course } from "@/lib/events-data";
import { cn } from "@/lib/utils";

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

      {/* ── Event video (supplementary) ──────────────────────────────────── */}
      {recap?.video && (
        <section
          aria-label="Event video"
          className="relative bg-surface py-20 lg:py-24"
        >
          <Container size="wide">
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow tone="accent" className="justify-center">
                In motion
              </SectionEyebrow>
              <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-primary md:text-4xl text-balance">
                A look at the day.
              </h2>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-10 sm:flex-row sm:items-start sm:gap-14">
              {/* Featured clip — click to play, with sound */}
              <figure className="w-full max-w-[320px]">
                <FeaturedVideo
                  src={recap.video.featured}
                  poster={recap.video.poster}
                  aspect={recap.video.aspect}
                />
                <figcaption className="mt-3 text-center text-xs text-ink-muted">
                  Tap to play with sound
                </figcaption>
              </figure>

              {/* Supplementary auto-looping silent clips */}
              <div className="w-full max-w-[220px]">
                <SilentVideoCarousel
                  clips={recap.video.clips}
                  aspect={recap.video.aspect}
                />
              </div>
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

/**
 * Click-to-play featured clip. Shows a poster with a play button; on click it
 * swaps in the real <video> (autoplays with sound because the click is a user
 * gesture) with native controls. Never autoplays on load.
 */
function FeaturedVideo({
  src,
  poster,
  aspect,
}: {
  src: string;
  poster: string;
  aspect: string;
}): React.ReactElement {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-primary/10 bg-primary shadow-[0_24px_60px_-30px_rgba(13,35,64,0.5)]"
      style={{ aspectRatio: aspect }}
    >
      {playing ? (
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play the event video with sound"
          className="group absolute inset-0 h-full w-full"
        >
          <Image src={poster} alt="" fill sizes="320px" className="object-cover" />
          <span className="absolute inset-0 bg-primary/25 transition-colors group-hover:bg-primary/10" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-primary shadow-lg transition-transform group-hover:scale-105">
              <Play className="h-7 w-7 translate-x-0.5 fill-current" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * Auto-advancing loop of short silent clips. The current clip plays muted (so
 * autoplay is permitted) and, when it ends, advances to the next — wrapping
 * around so the sequence loops continuously. `key` remounts each clip so it
 * restarts and autoplays.
 */
function SilentVideoCarousel({
  clips,
  aspect,
}: {
  clips: ReadonlyArray<string>;
  aspect: string;
}): React.ReactElement {
  const [index, setIndex] = useState(0);
  const advance = (): void => setIndex((i) => (i + 1) % clips.length);

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary/5"
        style={{ aspectRatio: aspect }}
      >
        <video
          key={index}
          src={clips[index]}
          autoPlay
          muted
          playsInline
          onEnded={advance}
          aria-label={`Event highlight clip ${index + 1} of ${clips.length}`}
          className="h-full w-full object-cover"
        />
      </div>
      {clips.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {clips.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show clip ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-primary" : "w-1.5 bg-primary/25",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
