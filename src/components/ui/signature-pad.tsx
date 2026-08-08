"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

/**
 * Export the drawing cropped tightly to its ink (plus small padding). A tall
 * signature pad otherwise emits a mostly-empty image, which then renders tiny
 * when placed on the certificate's signature line. Falls back to the full
 * canvas if nothing is found.
 */
function trimmedDataUrl(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 12) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return canvas.toDataURL("image/png");

  const pad = Math.round(8 * (window.devicePixelRatio || 1));
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width, maxX + pad);
  maxY = Math.min(height, maxY + pad);
  const w = maxX - minX;
  const h = maxY - minY;

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")?.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
  return out.toDataURL("image/png");
}

/**
 * Finger/stylus/mouse signature pad on an HTML canvas.
 *
 * Uses Pointer Events so touch, pen, and mouse all work with one code path,
 * and `touch-action: none` so drawing never scrolls the page on a phone.
 * Renders at devicePixelRatio for crisp strokes, and emits a PNG data URL
 * (or null when cleared) via `onChange`.
 */
export function SignaturePad({
  onChange,
  ariaLabel = "Signature pad",
}: {
  onChange: (dataUrl: string | null) => void;
  ariaLabel?: string;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  // Size the canvas backing store to its rendered size × DPR for sharp lines.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0d2340";
  }, []);

  const pointFromEvent = (
    e: React.PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    // setPointerCapture can throw for exotic pointer sources — never let that
    // abort drawing.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture unavailable — drawing still works without it */
    }
    drawing.current = true;
    last.current = pointFromEvent(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    // Track "has drawn" in a ref so the emit below never depends on React
    // having flushed the `empty` state between pointer events.
    if (!dirty.current) {
      dirty.current = true;
      setEmpty(false);
    }
  };

  const end = useCallback((): void => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas && dirty.current) onChange(trimmedDataUrl(canvas));
  }, [onChange]);

  const clear = (): void => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
    setEmpty(true);
    onChange(null);
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/25 bg-white">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={ariaLabel}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          className="h-48 w-full touch-none"
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-ink-muted/60">
            Sign here with your finger
          </span>
        )}
        <span className="pointer-events-none absolute bottom-3 left-4 right-4 border-b border-primary/20" />
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={clear}
          disabled={empty}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-primary disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear signature
        </button>
      </div>
    </div>
  );
}
