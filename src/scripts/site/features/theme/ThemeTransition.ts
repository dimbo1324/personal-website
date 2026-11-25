import { motion } from "../../core/motion";

/**
 * Circular "reveal" of the new theme, expanding from the click point.
 * Uses the View Transitions API when present; otherwise switches instantly.
 */
export class ThemeTransition {
  static readonly DURATION = 680;
  static readonly EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

  run(applyChange: () => void, origin: { readonly x: number; readonly y: number }): void {
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
        // Transition skipped (e.g. tab hidden) — the change is already applied.
      });
  }
}
