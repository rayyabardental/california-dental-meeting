"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  GraduationCap,
  MapPin,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { FLAGSHIP_COURSE } from "@/lib/events-data";
import { RegistrationModal } from "@/components/shared/registration-modal";

export function FlagshipCourse(): React.ReactElement {
  const [registering, setRegistering] = useState(false);
  const c = FLAGSHIP_COURSE;

  return (
    <section
      id="flagship"
      aria-label="Flagship Course — Veracruz 2026"
      className="relative bg-surface py-24 lg:py-32"
    >
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <div>
            <SectionEyebrow tone="gold">2026 Flagship Course</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
              {c.title}
            </h2>
            <p className="mt-2 text-base font-medium uppercase tracking-[0.2em] text-accent-600">
              {c.subtitle}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty">
              {c.description}
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
              <Meta
                icon={<Calendar className="h-4 w-4" />}
                label="Dates"
                value={c.dateLabel}
              />
              <Meta
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={`${c.city}, ${c.country}`}
              />
              <Meta
                icon={<GraduationCap className="h-4 w-4" />}
                label="CE Credits"
                value={`${c.ceCredits} credits`}
              />
              <Meta
                icon={<Users className="h-4 w-4" />}
                label="Duration"
                value="7 days / 6 clinical"
              />
            </dl>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {c.highlights.map((h) => (
                <motion.div
                  key={h}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm text-primary"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 flex-none text-gold" />
                  <span>{h}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_20px_50px_-30px_rgba(13,35,64,0.35)]">
              <div className="relative h-32 sunset-gradient">
                <div className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  CDM
                </div>
                <div className="absolute bottom-4 left-5 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                    Enrollment
                  </p>
                  <p className="font-display text-2xl font-medium">
                    {c.spotsRemaining}{" "}
                    <span className="text-base font-normal text-white/80">
                      / {c.capacity} seats left
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-6">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
                  <Tag className="h-3.5 w-3.5" />
                  Tuition
                </p>
                {c.earlyRegistrationActive && c.earlyPrice && c.regularPrice ? (
                  <>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-3xl text-primary">
                        {c.earlyPrice}
                      </span>
                      <span className="text-sm text-ink-muted line-through decoration-ink-muted/60">
                        {c.regularPrice}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                      Early registration · Limited time
                    </p>
                  </>
                ) : (
                  <p className="mt-1 font-display text-2xl text-primary">
                    {c.price}
                  </p>
                )}
                <p className="mt-1 text-xs text-ink-muted">
                  Includes hotel, ground transport, scrubs, materials, lunch
                  daily, and graduation dinner.
                </p>

                <div className="mt-5 space-y-1.5 border-t border-primary/8 pt-5 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                    Course Director
                  </p>
                  <p className="font-medium text-primary">{c.speaker.name}</p>
                  <p className="text-xs text-ink-muted">
                    {c.speaker.title} · {c.speaker.org}
                  </p>
                </div>

                <div className="mt-5 space-y-1.5 border-t border-primary/8 pt-5 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                    University Partner
                  </p>
                  <p className="font-medium text-primary">
                    {c.universityPartner}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setRegistering(true)}
                  >
                    Reserve your spot
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="md" href="#curriculum">
                    See full curriculum
                  </Button>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-ink-muted">
              Or call <a className="font-medium text-primary" href="tel:+19514639732">+1 (951) 463-9732</a> · Ray Buelna & Jacky Sanchez, Enrollment
            </p>
          </aside>
        </div>
      </Container>

      <RegistrationModal
        event={registering ? c : null}
        onClose={() => setRegistering(false)}
      />
    </section>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div>
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </p>
      <p className="mt-1.5 font-display text-base font-medium text-primary">
        {value}
      </p>
    </div>
  );
}
