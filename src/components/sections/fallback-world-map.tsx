"use client";

import type { Event } from "@/lib/events-data";
import { cn } from "@/lib/utils";

const VIEW_W = 1000;
const VIEW_H = 500;

function project(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * VIEW_W;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = VIEW_H / 2 - (VIEW_W * mercN) / (2 * Math.PI);
  return { x, y: Math.max(0, Math.min(VIEW_H, y)) };
}

export function FallbackWorldMap({
  events,
  activeId,
  onSelect,
}: {
  events: readonly Event[];
  activeId: string;
  onSelect: (event: Event) => void;
}): React.ReactElement {
  return (
    <div className="relative h-full w-full bg-[radial-gradient(ellipse_at_center,_rgba(0,180,216,0.12)_0%,_transparent_70%)]">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label="World map of Meridian events"
      >
        <defs>
          <pattern id="dotGrid" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.18)" />
          </pattern>
          <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,180,216,0.6)" />
            <stop offset="100%" stopColor="rgba(0,180,216,0)" />
          </radialGradient>
          <radialGradient id="markerGlowGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(201,168,76,0.7)" />
            <stop offset="100%" stopColor="rgba(201,168,76,0)" />
          </radialGradient>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#dotGrid)" />

        <g
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.6"
        >
          {/* North America */}
          <path d="M120 80 L240 70 L300 110 L290 200 L240 260 L170 280 L120 240 L90 170 Z" />
          {/* Central + South America */}
          <path d="M260 280 L300 270 L350 320 L330 420 L290 460 L260 420 L240 360 Z" />
          {/* Greenland */}
          <path d="M340 60 L390 65 L380 110 L340 100 Z" />
          {/* Europe */}
          <path d="M470 100 L560 95 L590 140 L570 180 L500 180 L470 145 Z" />
          {/* Africa */}
          <path d="M490 200 L590 200 L620 290 L580 380 L530 400 L490 340 L480 260 Z" />
          {/* Middle East / West Asia */}
          <path d="M600 160 L660 160 L680 220 L640 240 L605 215 Z" />
          {/* Russia / North Asia */}
          <path d="M580 80 L860 75 L880 140 L760 165 L620 145 L590 115 Z" />
          {/* India / South Asia */}
          <path d="M680 200 L730 200 L740 250 L700 270 L680 240 Z" />
          {/* East Asia */}
          <path d="M770 150 L880 150 L900 200 L880 240 L820 250 L780 210 Z" />
          {/* Southeast Asia / Indonesia */}
          <path d="M820 270 L900 270 L905 305 L850 320 L820 295 Z" />
          {/* Australia */}
          <path d="M820 340 L920 340 L940 390 L880 410 L820 390 Z" />
          {/* New Zealand */}
          <path d="M945 405 L965 405 L965 425 L945 425 Z" />
        </g>

        {events.map((event, idx) => {
          const { x, y } = project(event.lng, event.lat);
          const active = event.id === activeId;
          return (
            <g
              key={event.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              onClick={() => onSelect(event)}
              role="button"
              aria-label={event.title}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(event);
                }
              }}
            >
              <circle
                r={18}
                fill={active ? "url(#markerGlowGold)" : "url(#markerGlow)"}
              >
                <animate
                  attributeName="r"
                  values="14;22;14"
                  dur={`${2 + (idx % 4) * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                r={6}
                fill={active ? "#c9a84c" : "#00b4d8"}
                stroke="white"
                strokeWidth="1.6"
                className={cn(
                  "transition-transform duration-200",
                  active && "scale-110",
                )}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
