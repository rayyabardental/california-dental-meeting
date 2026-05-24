"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowUpRight,
  GraduationCap,
  Users,
  Globe2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { Button } from "@/components/ui/button";
import { EVENTS, type Event } from "@/lib/events-data";
import { cn } from "@/lib/utils";

const MapboxView = dynamic(
  () => import("./mapbox-view").then((m) => m.MapboxView),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

const FallbackWorldMap = dynamic(
  () => import("./fallback-world-map").then((m) => m.FallbackWorldMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

export function EventsMap(): React.ReactElement {
  const [active, setActive] = useState<Event>(EVENTS[0]);
  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  return (
    <section
      id="map"
      aria-label="Course location map"
      className="relative overflow-hidden bg-primary py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-stretch">
          <div>
            <SectionEyebrow tone="gold">Locations</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-white md:text-5xl text-balance">
              From Southern California to the Mexican coast.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/70 text-pretty">
              The 2026 flagship programme convenes in Veracruz at
              Universidad CEYESOV. Click any marker to see the course,
              schedule, and remaining seats.
            </p>

            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-surface-dark/30 backdrop-blur-md">
              <div className="aspect-[16/11] w-full">
                {hasToken ? (
                  <MapboxView
                    events={EVENTS}
                    activeId={active.id}
                    onSelect={setActive}
                  />
                ) : (
                  <FallbackWorldMap
                    events={EVENTS}
                    activeId={active.id}
                    onSelect={setActive}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/55">
                <Globe2 className="h-3.5 w-3.5" />
                <span>
                  {hasToken
                    ? "Mapbox · Navigation Night"
                    : "Stylized fallback view — set NEXT_PUBLIC_MAPBOX_TOKEN for full Mapbox."}
                </span>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <EventDetailPanel event={active} />
            <p className="mt-4 text-center text-xs text-white/45">
              Showing {EVENTS.length} upcoming events across{" "}
              {new Set(EVENTS.map((e) => e.country)).size} countries.
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function MapSkeleton(): React.ReactElement {
  return (
    <div
      role="status"
      aria-label="Loading map"
      className="h-full w-full bg-gradient-to-br from-primary-700 to-primary-800 shimmer"
    />
  );
}

function EventDetailPanel({ event }: { event: Event }): React.ReactElement {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl bg-white p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
      >
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            event.type === "CALIFORNIA"
              ? "bg-accent/10 text-accent-600"
              : event.type === "NATIONAL"
                ? "bg-gold/15 text-gold-600"
                : "bg-primary/10 text-primary",
          )}
        >
          {event.topic}
        </span>
        <h3 className="mt-4 font-display text-xl leading-tight text-primary text-balance">
          {event.title}
        </h3>
        <p className="mt-3 text-sm text-ink-muted text-pretty">
          {event.summary}
        </p>

        <dl className="mt-5 space-y-2.5 text-sm">
          <PanelRow icon={<Calendar className="h-3.5 w-3.5" />} text={event.dateLabel} />
          <PanelRow icon={<MapPin className="h-3.5 w-3.5" />} text={`${event.venue} — ${event.city}, ${event.country}`} />
          <PanelRow
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            text={`${event.ceCredits} CE credits · ${event.speaker.name}`}
          />
          <PanelRow
            icon={<Users className="h-3.5 w-3.5" />}
            text={
              event.status === "OPEN"
                ? `${event.spotsRemaining} of ${event.capacity} seats remaining`
                : "Announcing soon"
            }
          />
        </dl>

        <div className="mt-6 flex gap-2">
          <Button variant="primary" size="sm" href="/flagship" className="flex-1">
            View course
          </Button>
          <Button variant="ghost" size="sm" href="/contact">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PanelRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}): React.ReactElement {
  return (
    <div className="flex items-start gap-2 text-ink-muted">
      <span className="mt-0.5 text-accent">{icon}</span>
      <span className="text-pretty">{text}</span>
    </div>
  );
}
