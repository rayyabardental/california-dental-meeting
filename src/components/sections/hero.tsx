"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, MapPin, Calendar, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { CdmLogo } from "@/components/ui/cdm-logo";
import { FLAGSHIP_COURSE } from "@/lib/events-data";

const STATS: ReadonlyArray<{
  label: string;
  value: number;
  suffix?: string;
}> = [
  { label: "CE Credits", value: 35 },
  { label: "Clinical Days", value: 6 },
  { label: "Implants per Participant", value: 20 },
  { label: "Live Patient Surgery", value: 100, suffix: "%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export function Hero(): React.ReactElement {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden gradient-mesh pt-8 lg:pt-12"
      aria-label="Hero"
    >
      <div className="pointer-events-none absolute -top-40 right-1/2 -z-10 h-[40rem] w-[40rem] translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />

      <Container size="wide" className="pb-24 lg:pb-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
          }}
          className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-center"
        >
          <div className="pt-6">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold pulse-ring" />
              International Education · Clinical Excellence · Innovation
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-7 font-display text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.05] tracking-tight text-primary text-balance"
            >
              <span className="block">Place 15–20 implants on</span>
              <span className="gradient-text">live patients in Veracruz.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-lg leading-relaxed text-ink-muted text-pretty"
            >
              California Dental Meeting&apos;s flagship continuing-education
              programme: seven days of supervised live-patient implant
              surgery at <strong className="font-semibold text-primary">Universidad CEYESOV</strong>, directed by{" "}
              <strong className="font-semibold text-primary">Dr. Jaime Franco</strong>. 35 CE credits, hands-on
              workshops, and a graduation dinner on the Mexican coast.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button variant="primary" size="lg" href="/flagship">
                Reserve your spot
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="lg" href="/flagship#curriculum">
                See the curriculum
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.dl
              variants={fadeUp}
              className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4"
            >
              {STATS.map((s) => (
                <div key={s.label} className="border-l-2 border-gold/60 pl-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    {s.label}
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-medium text-primary">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.div
            variants={fadeUp}
            className="relative mx-auto w-full max-w-[34rem]"
          >
            <HeroVisual />
          </motion.div>
        </motion.div>
      </Container>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
    </section>
  );
}

function HeroVisual(): React.ReactElement {
  return (
    <div className="relative aspect-[5/6]">
      {/* Coastal sunset gradient — palm-silhouette inspired */}
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] sunset-gradient shadow-[0_30px_60px_-30px_rgba(13,35,64,0.55)]">
        {/* sun */}
        <div className="absolute right-12 top-32 h-40 w-40 rounded-full bg-gold/80 blur-[2px]" />
        <div className="absolute right-10 top-30 h-44 w-44 rounded-full bg-gold/30 blur-2xl" />
        {/* horizon line */}
        <div className="absolute inset-x-0 top-[58%] h-px bg-white/25" />
        {/* palm fronds (silhouettes) */}
        <svg
          viewBox="0 0 400 480"
          preserveAspectRatio="xMidYMax meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <g fill="#0d2340">
            {/* Big palm */}
            <rect x="78" y="200" width="6" height="220" rx="2" />
            <path d="M81 200 C 50 170, 30 175, 12 195 C 38 192, 60 198, 81 210 Z" />
            <path d="M81 200 C 110 170, 135 168, 158 188 C 130 190, 105 198, 81 210 Z" />
            <path d="M81 200 C 55 178, 20 160, 4 132 C 32 148, 60 170, 84 196 Z" />
            <path d="M81 200 C 108 178, 144 160, 162 132 C 134 150, 105 170, 84 196 Z" />
            <path d="M81 200 C 70 175, 60 138, 65 102 C 75 130, 82 168, 84 196 Z" />
            {/* Small palm 1 */}
            <rect x="172" y="240" width="4" height="180" rx="2" />
            <path d="M174 240 C 152 220, 132 222, 120 234 C 142 230, 162 235, 175 246 Z" />
            <path d="M174 240 C 195 220, 215 220, 230 232 C 208 230, 188 236, 175 246 Z" />
            <path d="M174 240 C 160 218, 144 192, 145 165 C 158 188, 170 220, 175 246 Z" />
            {/* Small palm 2 */}
            <rect x="210" y="262" width="4" height="160" rx="2" />
            <path d="M212 262 C 195 244, 178 246, 168 258 C 188 254, 202 258, 213 268 Z" />
            <path d="M212 262 C 230 244, 246 246, 258 258 C 238 254, 222 258, 213 268 Z" />
            {/* Lifeguard tower */}
            <g transform="translate(280, 280)">
              <rect x="0" y="40" width="44" height="36" />
              <polygon points="-4,40 48,40 22,18" />
              <rect x="10" y="76" width="3" height="56" />
              <rect x="31" y="76" width="3" height="56" />
              <rect x="-2" y="76" width="48" height="3" />
              <rect x="14" y="48" width="16" height="10" fill="#314f7a" />
            </g>
            {/* Ground line */}
            <rect y="420" width="400" height="60" />
          </g>
        </svg>
      </div>

      {/* CDM seal */}
      <div className="absolute right-6 top-6">
        <CdmLogo size={72} className="ring-white/50 shadow-2xl" />
      </div>

      {/* Floating cards */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute -bottom-6 -left-6 max-w-[17rem] rounded-2xl bg-white p-5 shadow-[0_20px_40px_-20px_rgba(13,35,64,0.4)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
          Flagship Course
        </p>
        <p className="mt-2 font-display text-lg font-medium leading-snug text-primary">
          {FLAGSHIP_COURSE.title}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
          <Calendar className="h-3.5 w-3.5 text-gold" />
          {FLAGSHIP_COURSE.dateLabel}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-3.5 w-3.5 text-gold" />
          {FLAGSHIP_COURSE.city}, {FLAGSHIP_COURSE.country}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="absolute -right-2 top-32 hidden max-w-[14rem] rounded-2xl glass-dark p-4 text-white sm:block"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
          University Partner
        </p>
        <p className="mt-2 inline-flex items-start gap-2 text-sm leading-snug text-white/85">
          <Stethoscope className="mt-0.5 h-3.5 w-3.5 flex-none text-gold" />
          Universidad CEYESOV — Veracruz
        </p>
      </motion.div>
    </div>
  );
}
