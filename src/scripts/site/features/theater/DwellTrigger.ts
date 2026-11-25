import { ticker } from "../../core/ticker";

interface DwellOptions {
  readonly duration: number;
  readonly onProgress: (progress: number) => void;
  readonly onComplete: () => void;
}

/** Fires a callback after the mouse has rested on an element for `duration`. */
export class DwellTrigger {
  readonly #element: HTMLElement;
  readonly #duration: number;
  readonly #onProgress: (progress: number) => void;
  readonly #onComplete: () => void;
  readonly #controller = new AbortController();
  #start = 0;
  #removeTick: (() => void) | null = null;

  constructor(element: HTMLElement, { duration, onProgress, onComplete }: DwellOptions) {
    this.#element = element;
    this.#duration = duration;
    this.#onProgress = onProgress;
    this.#onComplete = onComplete;
  }

  attach(): this {
    const { signal } = this.#controller;
    this.#element.addEventListener(
      "pointerenter",
      (event) => {
        if (event.pointerType === "mouse") this.#begin();
      },
      { signal },
    );
    this.#element.addEventListener("pointerleave", () => this.cancel(), { signal });
    return this;
  }

  cancel(): void {
    this.#removeTick?.();
    this.#removeTick = null;
    this.#onProgress(0);
  }

  destroy(): void {
    this.cancel();
    this.#controller.abort();
  }

  #begin(): void {
    this.cancel();
    this.#start = performance.now();
    this.#removeTick = ticker.add((now) => {
      const progress = Math.min(1, (now - this.#start) / this.#duration);
      this.#onProgress(progress);
      if (progress >= 1) {
        this.#removeTick?.();
        this.#removeTick = null;
        this.#onComplete();
      }
    });
  }
}
