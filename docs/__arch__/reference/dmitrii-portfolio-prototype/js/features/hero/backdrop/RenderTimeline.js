/**
 * Timeline of one backdrop render, as fractions of DURATION_MS.
 *
 *   0 ─ sample ─┬─ print head sweeps (serpentine) ─┬─ develop ─ 1
 *               headStart                          headEnd
 *   the target photo develops under the halftone from developStart,
 *   dots dissolve in the same serpentine order from dissolveStart.
 */
export const RenderTimeline = Object.freeze({
  DURATION_MS: 2300,
  sampleEnd: 0.05,
  headStart: 0.05,
  headEnd: 0.68,
  fly: 0.022,
  developStart: 0.6,
  developEnd: 0.94,
  dissolveStart: 0.7,
  dissolveSpan: 0.2,
  fadeOutEnd: 0.3,
  statusDevelopEnd: 0.98,

  /** Head progress 0..1 for a raw timeline position. */
  headProgress(rawT) {
    return (rawT - this.headStart) / (this.headEnd - this.headStart);
  },
});
