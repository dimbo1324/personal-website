"use client";

import { cn } from "@repo/ui/lib/utils";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { type ReactNode, useRef, useState } from "react";

/**
 * Seamless infinite marquee. The track is duplicated once and wrapped modulo
 * its own width, so speed can change mid-flight without a visible jump.
 */
export function Marquee({
  children,
  speed = 42,
  reverse = false,
  pauseOnHover = true,
  className,
  itemClassName,
}: {
  children: ReactNode;
  /** Pixels per second. */
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const width = trackRef.current?.offsetWidth ?? 0;
    if (width === 0) return;

    const target = pauseOnHover && hovered ? speed * 0.15 : speed;
    const step = (target * delta) / 1000;
    let next = offset.get() + (reverse ? step : -step);

    // Stay inside [-width, 0) — with two copies rendered that always covers the row.
    if (next <= -width) next += width;
    if (next >= 0) next -= width;

    offset.set(next);
  });

  return (
    <div
      className={cn("relative flex overflow-hidden", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div className="flex shrink-0" style={{ x: offset }}>
        <div ref={trackRef} className={cn("flex shrink-0 items-center", itemClassName)}>
          {children}
        </div>
        <div aria-hidden className={cn("flex shrink-0 items-center", itemClassName)}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
