/**
 * One passive scroll listener for the whole app, batched to animation frames.
 * Subscribers receive { y, progress, viewportHeight }.
 */
export class ScrollService {
  #listeners = new Set();
  #pending = false;
  #state = { y: 0, progress: 0, viewportHeight: window.innerHeight };

  start() {
    const schedule = () => {
      if (this.#pending) return;
      this.#pending = true;
      requestAnimationFrame(() => {
        this.#pending = false;
        this.#measure();
        this.#listeners.forEach((listener) => listener(this.#state));
      });
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    this.#measure();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }

  get state() {
    return this.#state;
  }

  /** @param {(state: {y:number, progress:number, viewportHeight:number}) => void} listener */
  subscribe(listener) {
    this.#listeners.add(listener);
    listener(this.#state);
    return () => this.#listeners.delete(listener);
  }

  #measure() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.#state = { y, progress: Math.min(1, Math.max(0, y / max)), viewportHeight: window.innerHeight };
  }
}
