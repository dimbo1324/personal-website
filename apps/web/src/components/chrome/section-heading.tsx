"use client";

import { cn } from "@repo/ui/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

import { SplitWords } from "@/components/motion/split-text";
import { drawLine, ease, viewportOnce } from "@/lib/motion";

/**
 * Every section opens the same way: an indexed eyebrow, a rule that draws
 * itself across the column, then the title. Repetition is the point — it's
 * what makes the page feel like one document.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  index: string;
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const centered = align === "center";

  return (
    <div className={cn("relative", centered && "mx-auto max-w-2xl text-center", className)}>
      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: 12 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: ease.expo }}
        className={cn("flex items-center gap-3", centered && "justify-center")}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-accent tabular-nums">
          {index}
        </span>
        <span className="size-1 rounded-full bg-accent/60" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-mist uppercase">
          {eyebrow}
        </span>
      </motion.div>

      <motion.div
        variants={reduced ? undefined : drawLine}
        initial={reduced ? undefined : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={viewportOnce}
        className={cn(
          "mt-4 h-px bg-linear-to-r from-accent/60 via-iron to-transparent",
          centered ? "origin-center from-transparent via-accent/50 to-transparent" : "origin-left",
        )}
      />

      <h2
        className={cn(
          "mt-6 font-display text-[clamp(1.9rem,4.2vw,3.15rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-chalk",
        )}
      >
        <SplitWords text={title} step={0.038} />
      </h2>

      {lede ? (
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, delay: 0.15, ease: ease.expo }}
          className={cn(
            "mt-5 max-w-xl text-[15px] leading-relaxed text-silver/80",
            centered && "mx-auto",
          )}
        >
          {lede}
        </motion.p>
      ) : null}
    </div>
  );
}
