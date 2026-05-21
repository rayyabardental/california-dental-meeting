"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { type Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Event } from "@/lib/events-data";

export function MapboxView({
  events,
  activeId,
  onSelect,
}: {
  events: readonly Event[];
  activeId: string;
  onSelect: (event: Event) => void;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [10, 25],
      zoom: 1.4,
      attributionControl: false,
      cooperativeGestures: true,
    });
    mapRef.current = map;
    const markers = markersRef.current;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    map.on("load", () => {
      events.forEach((event) => {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", event.title);
        el.className = "mb-marker";
        el.innerHTML = `
          <span class="mb-marker-ring"></span>
          <span class="mb-marker-dot"></span>
        `;
        el.addEventListener("click", () => {
          onSelect(event);
          map.flyTo({ center: [event.lng, event.lat], zoom: 5, speed: 0.8 });
        });
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([event.lng, event.lat])
          .addTo(map);
        markers.set(event.id, marker);
      });
    });

    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [events, onSelect]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (id === activeId) el.classList.add("active");
      else el.classList.remove("active");
    });
  }, [activeId]);

  return (
    <>
      <style jsx global>{`
        .mb-marker {
          position: relative;
          width: 28px;
          height: 28px;
          background: transparent;
          border: 0;
          cursor: pointer;
          padding: 0;
        }
        .mb-marker-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: rgba(0, 180, 216, 0.25);
          animation: mbpulse 2.4s cubic-bezier(0.66, 0, 0, 1) infinite;
        }
        .mb-marker-dot {
          position: absolute;
          inset: 6px;
          border-radius: 9999px;
          background: #00b4d8;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
        }
        .mb-marker.active .mb-marker-dot {
          background: #c9a84c;
        }
        .mb-marker.active .mb-marker-ring {
          background: rgba(201, 168, 76, 0.35);
        }
        @keyframes mbpulse {
          0% { transform: scale(0.85); opacity: 0.9; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        .mapboxgl-ctrl-attrib {
          background: rgba(13, 27, 42, 0.7) !important;
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .mapboxgl-ctrl-attrib a {
          color: rgba(255, 255, 255, 0.85) !important;
        }
      `}</style>
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
