"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Fixed background stack that everything else floats on:
 * grain → drafting grid → two slow accent blooms → vignette.
 * All of it is `pointer-events-none` and sits behind the content.
 */
export function Atmosphere() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 26, mass: 0.6 });

  const gridShift = useTransform(smooth, [0, 1], ["0px", "-140px"]);
  const bloomA = useTransform(smooth, [0, 1], ["0%", "38%"]);
  const bloomB = useTransform(smooth, [0, 1], ["0%", "-28%"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-void" />

      {/* drafting grid, parallaxed and faded at the edges */}
      <motion.div
        style={{ y: reduced ? 0 : gridShift }}
        className="absolute -inset-x-16 -top-40 -bottom-16 grid-field mask-radial-fade opacity-[0.55]"
      />
      <div className="absolute inset-0 grid-field-fine mask-radial-fade opacity-[0.22]" />

      {/* warm bloom */}
      <motion.div
        style={{ y: reduced ? 0 : bloomA }}
        className="absolute top-[-18%] left-[-10%] h-[70vh] w-[70vw] animate-drift rounded-full opacity-[0.5] blur-[130px]"
      >
        <div className="size-full rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_38%,transparent),transparent_70%)]" />
      </motion.div>

      {/* cool counterweight */}
      <motion.div
        style={{ y: reduced ? 0 : bloomB }}
        className="absolute right-[-14%] bottom-[-10%] h-[62vh] w-[62vw] animate-drift-slow rounded-full opacity-[0.38] blur-[150px]"
      >
        <div className="size-full rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent-deep)_46%,transparent),transparent_70%)]" />
      </motion.div>

      {/* horizon glow behind the fold */}
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,color-mix(in_srgb,var(--accent)_9%,transparent),transparent)]" />

      {/* vignette keeps the corners quiet */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_45%,transparent_35%,var(--color-void)_100%)]" />
    </div>
  );
}

/** Film grain over the whole page. Texture is a real photo, blended to a whisper. */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.16] mix-blend-overlay"
      style={{
        backgroundImage: "url(/images/tex-grain.jpg)",
        backgroundSize: "480px 480px",
      }}
    />
  );
}

/** Faint horizontal scan sweep — one pass every few seconds. */
export function ScanSweep() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[59] overflow-hidden opacity-40"
    >
      <div className="h-[3px] w-full animate-scan bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--accent)_28%,transparent),transparent)] blur-[2px]" />
    </div>
  );
}
