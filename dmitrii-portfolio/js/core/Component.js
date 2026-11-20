/**
 * Base class for every UI component.
 *
 * - owns an AbortController, so every listener registered through `on()`
 *   is removed automatically in `destroy()` (no leaks, no manual bookkeeping);
 * - keeps a list of disposers for non-DOM subscriptions (store, ticker, observers);
 * - subclasses override `mount()` and optionally `onDestroy()`.
 */
export class Component {
  #abortController = new AbortController();
  #disposers = [];
  #mounted = false;

  /** @param {any} root  the component's element (each subclass documents its exact type) */
  constructor(root) {
    if (!(root instanceof Element)) {
      throw new TypeError(`${new.target.name}: root element is required`);
    }
    /** @type {any} */
    this.root = root;
  }

  get isMounted() {
    return this.#mounted;
  }

  /** AbortSignal tied to the component lifetime. */
  get signal() {
    return this.#abortController.signal;
  }

  /**
   * addEventListener that is cleaned up on destroy().
   * @param {EventTarget} target
   * @param {string} type
   * @param {(event: any) => void} handler
   * @param {AddEventListenerOptions} [options]
   */
  on(target, type, handler, options = {}) {
    target.addEventListener(type, handler, { ...options, signal: this.signal });
    return this;
  }

  /** Register a cleanup callback (unsubscribe functions etc.). */
  own(disposer) {
    if (typeof disposer === "function") this.#disposers.push(disposer);
    return disposer;
  }

  /** Template method — subclasses implement setup here. */
  mount() {
    this.#mounted = true;
    return this;
  }

  /** Hook for subclasses. */
  onDestroy() {}

  destroy() {
    this.onDestroy();
    this.#abortController.abort();
    this.#disposers.splice(0).forEach((dispose) => dispose());
    this.#mounted = false;
  }
}
