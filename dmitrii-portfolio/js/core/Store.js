/**
 * Tiny observable key/value store.
 * Subscribers are keyed, so a component only re-renders for the slice it reads.
 */
export class Store {
  #state;
  #listeners = new Map();

  /** @param {Record<string, unknown>} initialState */
  constructor(initialState) {
    this.#state = { ...initialState };
  }

  get(key) {
    return this.#state[key];
  }

  /** Read-only snapshot for debugging / serialisation. */
  snapshot() {
    return Object.freeze({ ...this.#state });
  }

  set(key, value) {
    if (Object.is(this.#state[key], value)) return;
    const previous = this.#state[key];
    this.#state[key] = value;
    this.#listeners.get(key)?.forEach((listener) => listener(value, previous));
  }

  /** Functional update: store.update("cycle", (c) => c + 1) */
  update(key, updater) {
    this.set(key, updater(this.#state[key]));
  }

  /**
   * @param {string} key
   * @param {(value: unknown, previous: unknown) => void} listener
   * @param {{ immediate?: boolean }} [options]
   * @returns {() => void} unsubscribe
   */
  subscribe(key, listener, { immediate = true } = {}) {
    if (!this.#listeners.has(key)) this.#listeners.set(key, new Set());
    const bucket = this.#listeners.get(key);
    bucket.add(listener);
    if (immediate) listener(this.#state[key], undefined);
    return () => bucket.delete(listener);
  }
}
