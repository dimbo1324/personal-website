/**
 * Resolves after the window "load" event and the next idle period, so
 * heavy, non-critical work (video downloads, analytics) never competes
 * with the first render. Falls back to a timeout where requestIdleCallback
 * is missing (Safari).
 *
 * @param {{ timeout?: number }} [options]  upper bound for the idle wait
 * @returns {Promise<void>}
 */
export function whenPageIdle({ timeout = 1500 } = {}) {
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", () => resolve(), { once: true }));

  return loaded.then(
    () =>
      new Promise((resolve) => {
        if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout });
        else window.setTimeout(resolve, Math.min(timeout, 300));
      }),
  );
}
