"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import type { Course } from "@/lib/events-data";

/**
 * Faculty & sessions — for multi-speaker symposium courses. Renders each
 * faculty member's session topic and that session's learning objectives.
 * Returns null for courses without a `faculty` roster.
 */
export function CourseFaculty({
  course,
}: {
  course: Course;
}): React.ReactElement | null {
  const faculty = course.faculty;
  if (!faculty || faculty.length === 0) return null;

  return (
    <section
      id="faculty"
      aria-label={`${course.title} — faculty and sessions`}
      className="relative bg-surface py-24 lg:py-32"
    >
      <Container size="wide">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow tone="gold" className="justify-center">
            Faculty &amp; Sessions
          </SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
            {faculty.length} expert sessions in one day.
          </h2>
          <p className="mt-5 text-lg text-ink-muted text-pretty">
            Each faculty member leads a focused session with its own learning
            objectives.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-6">
          {faculty.map((f, i) => (
            <motion.article
              key={f.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.18) }}
              className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_1px_2px_rgba(13,35,64,0.04)]"
            >
              <div
                className={
                  f.image
                    ? "grid gap-0 md:grid-cols-[16rem_1fr]"
                    : undefined
                }
              >
                {f.image && (
                  <div className="relative border-b border-primary/8 bg-sand-100 md:border-b-0 md:border-r">
                    <Image
                      src={f.image}
                      alt={`${f.name} — ${f.topic} session flyer, ${course.title}.`}
                      width={1024}
                      height={1536}
                      sizes="(max-width: 768px) 100vw, 16rem"
                      className="h-full w-full object-cover object-top md:object-center"
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
                        Faculty
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-medium text-primary">
                        {f.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-ink text-pretty">
                        {f.topic}
                      </p>
                    </div>
                    {f.note && (
                      <span className="flex-none rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                        {f.note}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 border-t border-primary/8 pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                      Learning objectives
                    </p>
                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {f.objectives.map((o) => (
                        <li
                          key={o}
                          className="flex items-start gap-2.5 text-sm text-ink"
                        >
                          <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
                          <span className="text-pretty">{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
