/**
 * Single shared requestAnimationFrame loop.
 * The loop only runs while at least one subscriber is registered,
 * so idle pages cost zero frames.
 */
class Ticker {
  #callbacks = new Set();
  #frameId = 0;

  #loop = (now) => {
    this.#frameId = 0;
    this.#callbacks.forEach((callback) => callback(now));
    if (this.#callbacks.size > 0) this.#frameId = requestAnimationFrame(this.#loop);
  };

  /**
   * @param {(now: number) => void} callback
   * @returns {() => void} remove
   */
  add(callback) {
    this.#callbacks.add(callback);
    if (!this.#frameId) this.#frameId = requestAnimationFrame(this.#loop);
    return () => this.remove(callback);
  }

  remove(callback) {
    this.#callbacks.delete(callback);
    if (this.#callbacks.size === 0 && this.#frameId) {
      cancelAnimationFrame(this.#frameId);
      this.#frameId = 0;
    }
  }
}

export const ticker = new Ticker();
