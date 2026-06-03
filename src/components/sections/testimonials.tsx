"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials-data";
import { cn } from "@/lib/utils";

export function Testimonials(): React.ReactElement {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = TESTIMONIALS.length;
  const current: Testimonial = TESTIMONIALS[index]!;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, total]);

  const accentClass: Record<Testimonial["accent"], string> = {
    primary: "from-primary to-primary-700",
    accent: "from-accent to-accent-600",
    gold: "from-gold to-gold-500",
  };

  return (
    <section
      id="testimonials"
      aria-label="Member testimonials"
      className="relative overflow-hidden bg-surface-dark py-24 lg:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow tone="gold" className="justify-center">
            Alumni Voices
          </SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-white md:text-5xl text-balance">
            From the CDM alumni community.
          </h2>
          <p className="mt-4 text-sm uppercase tracking-[0.18em] text-white/40">
            (Placeholder quotes — real alumni testimonials to be collected after Veracruz 2027)
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl">
          <Quote className="pointer-events-none absolute -left-2 -top-6 h-16 w-16 text-gold/30" />

          <div className="relative min-h-[16rem]">
            <AnimatePresence mode="wait">
              <motion.figure
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
                className="relative"
              >
                <blockquote className="font-display text-2xl leading-snug text-white md:text-3xl text-balance">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span
                    className={cn(
                      "grid h-12 w-12 flex-none place-items-center rounded-full bg-gradient-to-br text-sm font-semibold text-white",
                      accentClass[current.accent],
                    )}
                  >
                    {current.initials}
                  </span>
                  <div className="text-left">
                    <p className="font-medium text-white">{current.author}</p>
                    <p className="text-sm text-white/55">
                      {current.specialty} · {current.city}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-8 bg-gold" : "w-3 bg-white/20",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <NavButton
                label="Previous testimonial"
                onClick={() => setIndex((i) => (i - 1 + total) % total)}
              >
                <ChevronLeft className="h-4 w-4" />
              </NavButton>
              <NavButton
                label="Next testimonial"
                onClick={() => setIndex((i) => (i + 1) % total)}
              >
                <ChevronRight className="h-4 w-4" />
              </NavButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function NavButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-gold hover:text-gold"
    >
      {children}
    </button>
  );
}
