"use client";

import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { ease } from "@/lib/motion";

/**
 * Word-by-word mask reveal. Each word sits in an `overflow-hidden` slot and
 * slides up out of it, which reads like type being set rather than faded in.
 */
export function SplitWords({
  text,
  className,
  wordClassName,
  delay = 0,
  step = 0.045,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  step?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={cn("inline", className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            className={cn("inline-block", wordClassName)}
            initial={{ y: "115%", opacity: 0, rotate: 3 }}
            whileInView={{ y: "0%", opacity: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: ease.expo, delay: delay + index * step }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </span>
  );
}

/**
 * Cycles through phrases in place. The outgoing phrase blurs upward while the
 * incoming one rises into the same slot, so the line never reflows.
 */
export function RotatingWord({
  words,
  className,
  wordClassName,
  interval = 2600,
}: {
  words: readonly string[];
  className?: string;
  /**
   * Applied to the animated word only. Anything using `background-clip: text`
   * belongs here, not on the wrapper: on the wrapper the clip is computed from
   * every descendant glyph, so the hidden sizer would paint through it too.
   */
  wordClassName?: string;
  interval?: number;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = setInterval(() => setIndex((value) => (value + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [interval, reduced, words.length]);

  if (reduced) {
    return (
      <span className={className}>
        <span className={wordClassName}>{words[0]}</span>
      </span>
    );
  }

  return (
    <span className={cn("relative inline-grid align-bottom", className)}>
      {/* Invisible sizer keeps the headline width stable across phrases. */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {longest}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          className={cn("col-start-1 row-start-1 whitespace-nowrap", wordClassName)}
          initial={{ y: "0.5em", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-0.5em", opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: ease.expo }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Scrambles through glyphs before settling on the target string.
 * Used sparingly — on the wordmark and on section indices.
 */
export function ScrambleText({
  text,
  className,
  trigger = "hover",
}: {
  text: string;
  className?: string;
  trigger?: "hover" | "mount";
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const [running, setRunning] = useState(trigger === "mount");

  useEffect(() => {
    if (reduced || !running) return;

    const glyphs = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ01#/\\<>*";
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 2);
      setDisplay(
        text
          .split("")
          .map((char, index) =>
            index < revealed || char === " "
              ? char
              : glyphs[Math.floor(Math.random() * glyphs.length)],
          )
          .join(""),
      );
      if (revealed >= text.length) {
        clearInterval(id);
        setDisplay(text);
        setRunning(false);
      }
    }, 34);

    return () => clearInterval(id);
  }, [reduced, running, text]);

  return (
    <span
      className={className}
      onMouseEnter={trigger === "hover" ? () => setRunning(true) : undefined}
      // Reserve the final width so the scramble never nudges the layout.
      style={{ display: "inline-block", minWidth: `${text.length}ch` }}
    >
      {running && !reduced ? display : text}
    </span>
  );
}
