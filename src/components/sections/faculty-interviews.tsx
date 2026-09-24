"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import type { FacultyInterview } from "@/lib/events-data";
import { cn } from "@/lib/utils";

/** Auto-advance interval (5 minutes). Must match `.carousel-progress` in globals.css. */
const ADVANCE_MS = 5 * 60 * 1000;

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Faculty interview carousel: presenter details on the left, their interview
 * video on the right. Both halves are keyed to the same slide so they fade
 * out and in together.
 *
 * Auto-advances every 5 minutes, but holds while:
 *   - the viewer has started the interview on this slide. Interviews run
 *     longer than the interval, and a YouTube embed can't report that it has
 *     finished without loading YouTube's API script, so the hold lasts until
 *     they move to another presenter,
 *   - the pointer is over it or keyboard focus is inside it (WAI carousel
 *     pattern), or
 *   - the viewer has paused auto-advance (WCAG 2.2.2 Pause, Stop, Hide).
 */
export function FacultyInterviews({
  interviews,
  courseTitle,
}: {
  interviews: ReadonlyArray<FacultyInterview>;
  courseTitle: string;
}): React.ReactElement | null {
  const count = interviews.length;
  const [index, setIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const reduceMotion = useReducedMotion();

  const holding = engaged || paused || pointerInside || focusInside;

  useEffect(() => {
    if (count < 2 || holding) return;
    const t = window.setTimeout(() => {
      setEngaged(false);
      setIndex((i) => (i + 1) % count);
    }, ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [index, holding, count]);

  const current = interviews[index];
  if (!current) return null;

  const goTo = (i: number): void => {
    setEngaged(false);
    setIndex(((i % count) + count) % count);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    // Arrow keys inside the video player seek the video; leave those alone.
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "VIDEO" || tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const prev = interviews[(index - 1 + count) % count];
  const next = interviews[(index + 1) % count];

  return (
    <section
      id="faculty-interviews"
      aria-labelledby="faculty-interviews-heading"
      className="relative bg-white py-20 lg:py-28"
    >
      <Container size="wide">
        <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <SectionEyebrow tone="accent">Faculty interviews</SectionEyebrow>
          <h2
            id="faculty-interviews-heading"
            className="mt-4 font-display text-3xl font-medium tracking-tight text-primary md:text-4xl text-balance"
          >
            Hear from the faculty.
          </h2>
          <p className="mt-3 text-base text-ink-muted text-pretty">
            Short interviews with the clinicians presenting at {courseTitle}.
          </p>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Faculty interviews"
          onKeyDown={onKeyDown}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") setPointerInside(true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setPointerInside(false);
          }}
          onFocus={() => setFocusInside(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setFocusInside(false);
            }
          }}
          className="mt-10"
        >
          {/* Announce slide changes only while rotation is stopped; announcing
              every automatic rotation would be noise for screen readers. */}
          <div aria-live={holding ? "polite" : "off"}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}: ${current.name}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
                className={cn(
                  "grid gap-8 lg:items-center lg:gap-12",
                  current.orientation === "portrait"
                    ? "lg:grid-cols-[minmax(0,1fr)_18rem]"
                    : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
                )}
              >
                <PresenterPanel
                  interview={current}
                  position={index + 1}
                  count={count}
                />
                <InterviewPlayer
                  interview={current}
                  playing={engaged}
                  onStart={() => setEngaged(true)}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {count > 1 && prev && next && (
            <div className="mt-8">
              <div
                aria-hidden="true"
                className="relative h-0.5 w-full overflow-hidden rounded-full bg-primary/10 motion-reduce:hidden"
              >
                {/* Remounts (and so restarts) whenever the timer restarts:
                    on every slide change and on resuming from a hold. */}
                {!holding && (
                  <span
                    key={`${index}-running`}
                    className="carousel-progress absolute inset-0 bg-accent"
                  />
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  {/* Hidden on phones: the panel already shows "Presenter 01 / 06",
                      and with six dots the row otherwise overflows at 320px. */}
                  <span className="hidden text-sm tabular-nums text-ink-muted sm:inline">
                    <span className="font-medium text-primary">
                      {pad(index + 1)}
                    </span>{" "}
                    / {pad(count)}
                  </span>
                  <div className="flex items-center">
                    {interviews.map((iv, i) => (
                      <button
                        key={iv.name}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Show ${iv.name}`}
                        aria-current={i === index ? "true" : undefined}
                        className="grid h-6 place-items-center px-1"
                      >
                        <span
                          className={cn(
                            "block h-1.5 rounded-full transition-all",
                            i === index
                              ? "w-6 bg-primary"
                              : "w-1.5 bg-primary/25 hover:bg-primary/50",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <NavButton
                    label={
                      paused ? "Resume auto-advance" : "Pause auto-advance"
                    }
                    onClick={() => setPaused((p) => !p)}
                  >
                    {paused ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </NavButton>
                  <NavButton
                    label={`Previous presenter: ${prev.name}`}
                    onClick={() => goTo(index - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </NavButton>
                  <NavButton
                    label={`Next presenter: ${next.name}`}
                    onClick={() => goTo(index + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </NavButton>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </Container>
    </section>
  );
}

function PresenterPanel({
  interview,
  position,
  count,
}: {
  interview: FacultyInterview;
  position: number;
  count: number;
}): React.ReactElement {
  const byline = [interview.credentials, interview.country]
    .filter(Boolean)
    .join(" · ");
  return (
    <div>
      <div className="flex items-start gap-5">
        <div className="relative aspect-[4/5] w-28 flex-none overflow-hidden rounded-2xl bg-sand-100 sm:w-32 lg:w-36">
          <Image
            src={interview.photo}
            alt={`Portrait of ${interview.name}`}
            fill
            sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 144px"
            className="object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
            Presenter {pad(position)} / {pad(count)}
          </p>
          <h3 className="mt-1 font-display text-2xl font-medium text-primary text-balance">
            {interview.name}
          </h3>
          {byline && (
            <p className="mt-1 text-sm text-ink-muted text-pretty">{byline}</p>
          )}
          <p className="mt-3 text-sm font-medium text-ink text-pretty">
            {interview.topic}
          </p>
        </div>
      </div>

      {interview.summary && (
        <div className="mt-6 border-t border-primary/8 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            About the presenter
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
            {interview.summary}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Accepts a YouTube share URL (youtu.be/…, youtube.com/watch?v=…, /embed/…,
 * /shorts/…) or a bare video ID and returns the 11-character ID, or null if
 * it isn't recognisable. The result is interpolated into an iframe URL, so it
 * is validated against YouTube's ID alphabet rather than trusted.
 */
function youtubeId(input: string | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  const valid = (id: string | null | undefined): string | null =>
    id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  if (valid(raw)) return raw;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    if (host === "youtu.be") return valid(url.pathname.slice(1));
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") return valid(url.searchParams.get("v"));
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      return valid(match?.[1]);
    }
  } catch {
    // Not a URL; fall through.
  }
  return null;
}

/**
 * Click-to-play YouTube player. Until the viewer presses play this is just a
 * thumbnail: no YouTube script, iframe, or cookies load, which keeps the page
 * light. The embed uses youtube-nocookie.com (privacy-enhanced mode), and only
 * the current slide's player is ever mounted.
 */
function InterviewPlayer({
  interview,
  playing,
  onStart,
}: {
  interview: FacultyInterview;
  playing: boolean;
  onStart: () => void;
}): React.ReactElement {
  const id = youtubeId(interview.youtube);
  const portrait = interview.orientation === "portrait";
  const thumbnail =
    interview.poster ?? (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);
  const imageSizes = portrait ? "288px" : "(max-width: 1024px) 100vw, 60vw";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-primary shadow-[0_24px_60px_-30px_rgba(13,35,64,0.5)]",
        // Vertical phone video: a 9:16 frame capped at 18rem, rather than a
        // 16:9 frame that would pillarbox it into a thin strip.
        portrait ? "mx-auto aspect-[9/16] w-full max-w-[18rem]" : "aspect-video",
      )}
    >
      {!id ? (
        // No link yet (or an unrecognisable one): show the still, clearly
        // marked, rather than a play button that leads nowhere.
        <div className="absolute inset-0">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes={imageSizes}
              className="object-cover opacity-60"
            />
          ) : (
            <span className="absolute inset-0 gradient-mesh-dark" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-primary/10" />
          <span className="absolute bottom-5 left-5 right-5 text-left text-white">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Interview coming soon
            </span>
            <span className="mt-0.5 block text-sm font-medium">
              {interview.name}
            </span>
          </span>
        </div>
      ) : playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={`Interview with ${interview.name}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={onStart}
          aria-label={`Play interview with ${interview.name}`}
          className="group absolute inset-0 h-full w-full"
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes={imageSizes}
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 gradient-mesh-dark" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/20 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-105 group-focus-visible:scale-105">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </span>
          <span className="absolute bottom-4 left-5 right-5 text-left text-white">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Faculty interview
            </span>
            <span className="mt-0.5 block text-sm font-medium">
              {interview.name}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      {children}
    </button>
  );
}
