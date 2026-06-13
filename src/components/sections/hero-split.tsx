"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/sections/hero-carousel";
import type {
  CarouselSlide,
  HeroMascot,
  HeroMission,
} from "@/lib/hero-data";

/**
 * Split-column homepage hero.
 *
 * Layout
 * ──────
 *   Desktop (lg+):  [ mascot + mission ]  [ carousel ]
 *   Mobile (<lg):    mascot + mission
 *                    carousel below
 *
 * The component is fully content-driven — pass the mascot, mission, and
 * slides as props. Slides update without redesign; add a new entry in
 * hero-data.ts and a new card appears in rotation.
 */
export function HeroSplit({
  mascot,
  mission,
  slides,
}: {
  mascot: HeroMascot;
  mission: HeroMission;
  slides: ReadonlyArray<CarouselSlide>;
}): React.ReactElement {
  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative isolate overflow-hidden gradient-mesh pt-10 pb-20 lg:pt-16 lg:pb-28"
    >
      <div className="pointer-events-none absolute -top-40 right-1/2 -z-10 h-[40rem] w-[40rem] translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />

      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* ─────────────────── Left: mascot + mission ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-gold pulse-ring" />
              International Education · Clinical Excellence
            </span>

            <div className="relative mt-6 w-full max-w-[15rem] sm:max-w-sm lg:max-w-md">
              <Image
                src={mascot.mascotImage}
                alt={mascot.mascotAlt}
                width={1536}
                height={1024}
                priority
                sizes="(max-width: 640px) 60vw, (max-width: 1024px) 24rem, 32rem"
                className="h-auto w-full"
              />
            </div>

            <h1 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.4rem)] font-medium leading-[1.05] tracking-tight text-primary text-balance lg:mt-8">
              <span className="gradient-text">{mission.missionHeading}</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted text-pretty sm:text-lg">
              {mission.missionText}
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button href="/courses" variant="primary" size="lg">
                Explore courses
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                href="/courses/basic-dental-implant-course-veracruz-2026"
                variant="ghost"
                size="lg"
              >
                Veracruz 2027 — flagship
              </Button>
            </div>
          </motion.div>

          {/* ───────────────────── Right: carousel ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <HeroCarousel slides={slides} />
          </motion.div>
        </div>
      </Container>

      <div className="mt-14 h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent lg:mt-20" />
    </section>
  );
}
