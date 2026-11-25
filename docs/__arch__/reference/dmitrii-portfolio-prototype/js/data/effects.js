/**
 * Effects budget: how often the decorative animations run on their own.
 * Everything here is skipped entirely with prefers-reduced-motion.
 */
export const EFFECTS = Object.freeze({
  hero: Object.freeze({
    /** Re-render the hero raster on a timer. Off: it only renders when a scene is clicked. */
    autoCycle: false,
    cycleMs: 6800,
    /** Frame rate of the idle dot field behind the hero (the raster render itself runs at full rate). */
    ambientFps: 30,
  }),
  emblem: Object.freeze({
    /** Pause between the automatic DP → avatar flips. */
    intervalMs: 19000,
    /** How long the avatar side stays up. */
    holdMs: 3600,
  }),
});
