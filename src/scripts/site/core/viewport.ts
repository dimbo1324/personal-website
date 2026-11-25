export class ViewportObserver {
  readonly #observer: IntersectionObserver;
  readonly #callbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();

  constructor(options: IntersectionObserverInit = {}) {
    this.#observer = new IntersectionObserver((entries) => {
      for (const entry of entries) this.#callbacks.get(entry.target)?.(entry);
    }, options);
  }

  watch(element: Element, callback: (entry: IntersectionObserverEntry) => void): () => void {
    this.#callbacks.set(element, callback);
    this.#observer.observe(element);
    return () => this.unwatch(element);
  }

  unwatch(element: Element): void {
    this.#callbacks.delete(element);
    this.#observer.unobserve(element);
  }

  disconnect(): void {
    this.#observer.disconnect();
  }
}
