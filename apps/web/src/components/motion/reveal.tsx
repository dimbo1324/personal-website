"use client";

import { cn } from "@repo/ui/lib/utils";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

import { fadeUp, stagger, viewportOnce, wipeUp } from "@/lib/motion";

const presets = { fadeUp, wipeUp } satisfies Record<string, Variants>;

interface RevealProps {
  children: ReactNode;
  className?: string;
  preset?: keyof typeof presets;
  delay?: number;
}

/** Scroll-triggered entrance for a single block. */
export function Reveal({ children, className, preset = "fadeUp", delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={presets[preset]}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  step?: number;
  delay?: number;
}

/** Parent wrapper: children marked with `<RevealItem>` come in one after another. */
export function RevealGroup({ children, className, step = 0.07, delay = 0 }: RevealGroupProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(step, delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  preset = "fadeUp",
}: {
  children: ReactNode;
  className?: string;
  preset?: keyof typeof presets;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={presets[preset]} className={cn(className)}>
      {children}
    </motion.div>
  );
}
