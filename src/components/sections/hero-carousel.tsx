"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  UserCircle2,
} from "lucide-react";
import type { CarouselSlide } from "@/lib/hero-data";
import { cn } from "@/lib/utils";

/**
 * Reusable, content-driven hero carousel.
 *
 * Behaviour
 * ─────────
 *   • Renders one slide at a time with restrained fade + slight horizontal
 *     slide transitions (no autoplay — predictable for users).
 *   • Previous / next arrow buttons, keyboard-accessible (Tab → Enter/Space).
 *   • Arrow-key navigation (← / →) while focus is anywhere inside the
 *     carousel region.
 *   • Pagination dots below the image; each is a focusable button.
 *   • Mobile: image and content stack into a single column inside the slide.
 *
 * Accessibility
 * ─────────────
 *   • `role="region"` + `aria-roledescription="carousel"` on the wrapper
 *     so assistive tech announces the structure correctly.
 *   • Each slide has `role="group"`, `aria-roledescription="slide"`, and a
 *     position label ("Slide 2 of 3").
 *   • `aria-live="polite"` on the slide container so a slide change is
 *     announced when triggered programmatically.
 *   • Native focus rings are preserved on every interactive control.
 */
export function HeroCarousel({
  slides,
  className,
}: {
  slides: ReadonlyArray<CarouselSlide>;
  className?: string;
}): React.ReactElement | null {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const regionRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const total = slides.length;
  const current = slides[index];

  const goTo = useCallback(
    (next: number): void => {
      if (total === 0) return;
      const wrapped = ((next % total) + total) % total;
      setDirection(wrapped > index || (wrapped === 0 && index === total - 1) ? 1 : -1);
      setIndex(wrapped);
    },
    [index, total],
  );

  const goNext = useCallback((): void => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback((): void => goTo(index - 1), [goTo, index]);

  // Arrow-key navigation when focus is anywhere inside the carousel.
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    region.addEventListener("keydown", handler);
    return () => region.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (!current || total === 0) return null;

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label="Featured course locations"
      role="region"
      className={cn("relative w-full", className)}
    >
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_20px_50px_-30px_rgba(13,35,64,0.35)]">
        <div
          aria-live="polite"
          aria-atomic="false"
          className="relative"
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.article
              key={current.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${total}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <SlideView slide={current} priority={index === 0} />
            </motion.article>
          </AnimatePresence>

          {/* Arrow controls — overlaid on the image */}
          {total > 1 && (
            <>
              <ArrowButton
                direction="prev"
                onClick={goPrev}
                aria-controls={`${id}-slides`}
              />
              <ArrowButton
                direction="next"
                onClick={goNext}
                aria-controls={`${id}-slides`}
              />
            </>
          )}
        </div>
      </div>

      {/* Pagination dots */}
      {total > 1 && (
        <nav
          aria-label="Carousel pagination"
          className="mt-5 flex items-center justify-center gap-2"
        >
          {slides.map((s, i) => {
            const isActive = i === index;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${s.headline}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isActive
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary/25 hover:bg-primary/45",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              />
            );
          })}
        </nav>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Slide content                                                              */
/* -------------------------------------------------------------------------- */

function SlideView({
  slide,
  priority,
}: {
  slide: CarouselSlide;
  priority: boolean;
}): React.ReactElement {
  const isOpen = slide.status === "OPEN";
  const statusLabel =
    slide.status === "OPEN"
      ? "Enrolling now"
      : slide.status === "ANNOUNCING_SOON"
        ? "Announcing soon"
        : "Waitlist open";

  return (
    <div className="grid">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100">
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority}
          className="object-cover"
        />
        {/* Subtle bottom scrim so overlays stay legible */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/35 to-transparent" />

        {/* Top-left: course type chip */}
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary backdrop-blur">
          {courseTypeLabel(slide.courseType)}
        </span>

        {/* Top-right: status pill */}
        <span
          className={cn(
            "absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur",
            isOpen
              ? "bg-accent/90 text-white"
              : "bg-white/85 text-ink-muted",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isOpen ? "bg-white" : "bg-ink-muted/70",
            )}
          />
          {statusLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
          {slide.courseTitle}
        </p>
        <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-primary text-balance sm:text-3xl">
          {slide.headline}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty sm:text-base">
          {slide.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-sm">
          <Meta icon={<Calendar className="h-3.5 w-3.5" />} text={slide.dates} />
          <Meta icon={<MapPin className="h-3.5 w-3.5" />} text={slide.location} />
          <Meta
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            text={slide.ceCredits}
          />
          <Meta
            icon={<UserCircle2 className="h-3.5 w-3.5" />}
            text={slide.instructor}
          />
        </dl>

        <Link
          href={slide.ctaHref}
          className={cn(
            "mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all",
            "hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.99]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            "shadow-[0_8px_18px_-6px_rgba(13,35,64,0.4)]",
          )}
        >
          {slide.ctaText}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Meta({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2 text-ink-muted">
      <span className="text-accent">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function courseTypeLabel(type: CarouselSlide["courseType"]): string {
  switch (type) {
    case "CALIFORNIA":
      return "California";
    case "NATIONAL":
      return "National";
    case "INTERNATIONAL":
      return "International";
    default:
      return "Course";
  }
}

/* -------------------------------------------------------------------------- */
/* Arrow controls                                                             */
/* -------------------------------------------------------------------------- */

function ArrowButton({
  direction,
  onClick,
  "aria-controls": ariaControls,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  "aria-controls"?: string;
}): React.ReactElement {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Previous slide" : "Next slide"}
      aria-controls={ariaControls}
      className={cn(
        "group absolute top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full",
        "bg-white/85 text-primary shadow-[0_8px_18px_-6px_rgba(13,35,64,0.4)] backdrop-blur",
        "transition-all duration-200 hover:bg-white hover:scale-105",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        isPrev ? "left-3 sm:left-4" : "right-3 sm:right-4",
      )}
    >
      {isPrev ? (
        <ChevronLeft className="h-5 w-5" />
      ) : (
        <ChevronRight className="h-5 w-5" />
      )}
    </button>
  );
}
