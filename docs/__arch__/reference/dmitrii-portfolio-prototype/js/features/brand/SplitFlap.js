import { motion } from "../../core/MotionPreference.js";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Split-flap ("departure board") letter: on `spin()` it ticks through random
 * glyphs — each tick is a quick flip on the X axis — and lands on its own
 * letter. Several flaps with different step counts land one after another.
 */
export class SplitFlap {
  static TICK_MS = 62;

  #element;
  #final;
  #timer = 0;

  /** @param {HTMLElement} element @param {{ steps?: number }} [options] */
  constructor(element, { steps = 8 } = {}) {
    this.#element = element;
    this.#final = element.textContent;
    this.steps = steps;
  }

  /** @returns {Promise<void>} resolves when the letter has landed */
  spin() {
    this.cancel();
    if (motion.reduced) return Promise.resolve();

    let step = 0;
    this.#element.classList.add("is-scrambling");
    return new Promise((resolve) => {
      this.#timer = window.setInterval(() => {
        step += 1;
        const landed = step >= this.steps;
        this.#element.textContent = landed ? this.#final : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        this.#flip();
        if (landed) {
          this.cancel();
          resolve();
        }
      }, SplitFlap.TICK_MS);
    });
  }

  cancel() {
    window.clearInterval(this.#timer);
    this.#timer = 0;
    this.#element.textContent = this.#final;
    this.#element.classList.remove("is-scrambling");
  }

  #flip() {
    this.#element.animate(
      [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-80deg)", offset: 0.45 }, { transform: "rotateX(0deg)" }],
      { duration: SplitFlap.TICK_MS + 20, easing: "ease-out" },
    );
  }
}
