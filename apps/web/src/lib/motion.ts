import { type Transition, type Variants } from "framer-motion";

/** Shared easing curves. `swift` is the house curve — decisive, no overshoot. */
export const ease = {
  swift: [0.32, 0.72, 0, 1],
  expo: [0.16, 1, 0.3, 1],
  back: [0.34, 1.4, 0.64, 1],
} as const;

export const spring: Transition = { type: "spring", stiffness: 320, damping: 34, mass: 0.8 };
export const springSoft: Transition = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 };
export const springSnappy: Transition = { type: "spring", stiffness: 520, damping: 36 };

/** Parent that staggers its children into view. */
export function stagger(step = 0.07, delay = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: step, delayChildren: delay } },
  };
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: ease.expo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: ease.swift } },
};

/** Clip-path wipe — reads as a plotter drawing the element rather than a fade. */
export const wipeUp: Variants = {
  hidden: { opacity: 0, y: "60%", clipPath: "inset(100% 0% 0% 0%)" },
  visible: {
    opacity: 1,
    y: "0%",
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.85, ease: ease.expo },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: ease.expo } },
};

/** Hairline that draws itself left-to-right. */
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1, ease: ease.expo } },
};

export const viewportOnce = { once: true, amount: 0.25 } as const;
