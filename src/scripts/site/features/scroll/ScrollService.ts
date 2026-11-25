export interface ScrollState {
  readonly y: number;
  readonly progress: number;
  readonly viewportHeight: number;
}

type ScrollListener = (state: ScrollState) => void;

/**
 * One passive scroll listener for the whole app, batched to animation frames.
 * Subscribers receive { y, progress, viewportHeight }.
 */
export class ScrollService {
  readonly #listeners = new Set<ScrollListener>();
  #pending = false;
  #state: ScrollState = { y: 0, progress: 0, viewportHeight: window.innerHeight };

  start(): () => void {
    const schedule = (): void => {
      if (this.#pending) return;
      this.#pending = true;
      requestAnimationFrame(() => {
        this.#pending = false;
        this.#measure();
        for (const listener of this.#listeners) listener(this.#state);
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

  get state(): ScrollState {
    return this.#state;
  }

  subscribe(listener: ScrollListener): () => void {
    this.#listeners.add(listener);
    listener(this.#state);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  #measure(): void {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.#state = {
      y,
      progress: Math.min(1, Math.max(0, y / max)),
      viewportHeight: window.innerHeight,
    };
  }
}
