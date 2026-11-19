import { motion } from "../../core/MotionPreference.js";

/**
 * Circular "reveal" of the new theme, expanding from the click point.
 * Uses the View Transitions API when present; otherwise switches instantly.
 */
export class ThemeTransition {
  static DURATION = 680;
  static EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

  /**
   * @param {() => void} applyChange  synchronous DOM update
   * @param {{ x: number, y: number }} origin viewport coordinates
   */
  run(applyChange, origin) {
    if (motion.reduced || typeof document.startViewTransition !== "function") {
      applyChange();
      return;
    }

    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );

    const transition = document.startViewTransition(applyChange);
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${origin.x}px ${origin.y}px)`,
              `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
            ],
          },
          {
            duration: ThemeTransition.DURATION,
            easing: ThemeTransition.EASING,
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        /* transition skipped (e.g. tab hidden) — the change is already applied */
      });
  }
}
