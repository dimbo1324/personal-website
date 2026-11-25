import { ticker } from "../../core/Ticker.js";

/**
 * Fires a callback after the mouse has rested on an element for `duration`.
 * Progress (0..1) is reported every frame so the UI can draw a ring and a
 * countdown; leaving the element cancels and rewinds. Touch/pen are ignored
 * (they use a normal tap instead).
 */
export class DwellTrigger {
  #element;
  #duration;
  #onProgress;
  #onComplete;
  #start = 0;
  #removeTick = null;
  #controller = new AbortController();

  /**
   * @param {HTMLElement} element
   * @param {{ duration: number, onProgress: (p: number) => void, onComplete: () => void }} options
   */
  constructor(element, { duration, onProgress, onComplete }) {
    this.#element = element;
    this.#duration = duration;
    this.#onProgress = onProgress;
    this.#onComplete = onComplete;
  }

  attach() {
    const { signal } = this.#controller;
    this.#element.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && this.#begin(), { signal });
    this.#element.addEventListener("pointerleave", () => this.cancel(), { signal });
    return this;
  }

  cancel() {
    this.#removeTick?.();
    this.#removeTick = null;
    this.#onProgress(0);
  }

  destroy() {
    this.cancel();
    this.#controller.abort();
  }

  #begin() {
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
