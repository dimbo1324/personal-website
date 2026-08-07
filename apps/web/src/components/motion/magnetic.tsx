"use client";

import { cn } from "@repo/ui/lib/utils";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { type ReactNode, useRef } from "react";

import { useFinePointer } from "@/lib/hooks";

/**
 * Pulls its child toward the cursor while hovered. Subtle by default — the
 * effect should be felt more than seen.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 90,
  className,
}: {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef<HTMLSpanElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 22, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 260, damping: 22, mass: 0.5 });

  const enabled = fine && !reduced;

  function onPointerMove(event: React.PointerEvent<HTMLSpanElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    const falloff = Math.max(0, 1 - distance / (radius + rect.width / 2));
    rawX.set(dx * strength * falloff);
    rawY.set(dy * strength * falloff);
  }

  function reset() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.span
      ref={ref}
      // NB: framer-motion forces `display: inline-block` inline on a motion
      // span so it can be transformed. That inline style beats any `hidden`
      // utility passed in here — wrap this component to hide it responsively.
      className={cn(className)}
      style={enabled ? { x, y } : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}
