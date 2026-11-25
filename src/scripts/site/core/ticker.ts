class Ticker {
  readonly #callbacks = new Set<(now: number) => void>();
  #frameId = 0;

  readonly #loop = (now: number): void => {
    this.#frameId = 0;
    for (const callback of this.#callbacks) callback(now);
    if (this.#callbacks.size > 0) this.#frameId = requestAnimationFrame(this.#loop);
  };

  add(callback: (now: number) => void): () => void {
    this.#callbacks.add(callback);
    if (!this.#frameId) this.#frameId = requestAnimationFrame(this.#loop);
    return () => this.remove(callback);
  }

  remove(callback: (now: number) => void): void {
    this.#callbacks.delete(callback);
    if (this.#callbacks.size === 0 && this.#frameId) {
      cancelAnimationFrame(this.#frameId);
      this.#frameId = 0;
    }
  }
}

export const ticker = new Ticker();
