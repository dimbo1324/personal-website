"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { ease } from "@/lib/motion";

/** Counts from zero to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  suffix = "",
  duration = 1.8,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    const controls = animate(0, value, {
      duration,
      ease: ease.expo,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [duration, inView, reduced, value]);

  // Reduced motion (and the pre-scroll state) show the figure directly.
  const shown = reduced ? value : display;

  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}
