"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { formatNumber } from "@/lib/utils";

export function CountUp({
  to,
  durationMs = 1800,
  suffix = "",
  prefix = "",
  className,
}: {
  to: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}): React.ReactElement {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(value)}
      {suffix}
    </span>
  );
}
