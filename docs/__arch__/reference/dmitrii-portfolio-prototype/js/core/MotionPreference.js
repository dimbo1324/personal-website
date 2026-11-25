/**
 * Live view of the OS "reduce motion" setting.
 * Components ask `motion.reduced` instead of querying matchMedia themselves.
 */
class MotionPreference {
  #query = window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;

  get reduced() {
    return Boolean(this.#query?.matches);
  }

  /** @param {(reduced: boolean) => void} listener @returns {() => void} */
  onChange(listener) {
    if (!this.#query) return () => {};
    const handler = (event) => listener(event.matches);
    this.#query.addEventListener("change", handler);
    return () => this.#query.removeEventListener("change", handler);
  }
}

export const motion = new MotionPreference();
