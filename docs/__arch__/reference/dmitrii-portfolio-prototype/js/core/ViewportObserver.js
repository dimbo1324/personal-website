/**
 * Thin wrapper around IntersectionObserver that shares one observer per
 * option-set and exposes a simple watch/unwatch API.
 */
export class ViewportObserver {
  #observer;
  #callbacks = new WeakMap();

  /** @param {IntersectionObserverInit} options */
  constructor(options = {}) {
    this.#observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => this.#callbacks.get(entry.target)?.(entry));
    }, options);
  }

  /**
   * @param {Element} element
   * @param {(entry: IntersectionObserverEntry) => void} callback
   * @returns {() => void} unwatch
   */
  watch(element, callback) {
    this.#callbacks.set(element, callback);
    this.#observer.observe(element);
    return () => this.unwatch(element);
  }

  unwatch(element) {
    this.#callbacks.delete(element);
    this.#observer.unobserve(element);
  }

  disconnect() {
    this.#observer.disconnect();
  }
}
