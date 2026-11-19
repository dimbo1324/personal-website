import { Component } from "../../core/Component.js";
import { ScrambleText } from "./ScrambleText.js";
import { motion } from "../../core/MotionPreference.js";

/**
 * Cycles engineering disciplines in the hero eyebrow.
 * Auto-advances only while visible; click advances manually.
 */
export class RoleTicker extends Component {
  static INTERVAL_MS = 4400;

  #phrases;
  #index = 0;
  #scramble;
  #timer = 0;
  #visible = true;

  /**
   * @param {HTMLButtonElement} root
   * @param {{ text: HTMLElement, phrases: readonly string[], viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options
   */
  constructor(root, { text, phrases, viewport }) {
    super(root);
    this.#phrases = phrases;
    this.#scramble = new ScrambleText(text);
    this.viewport = viewport;
  }

  mount() {
    this.#scramble.play(this.#phrases[0]);
    this.on(this.root, "click", () => this.#advance());
    this.own(
      this.viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#schedule();
      }),
    );
    return super.mount();
  }

  onDestroy() {
    clearInterval(this.#timer);
    this.#scramble.cancel();
  }

  #schedule() {
    clearInterval(this.#timer);
    if (!this.#visible || motion.reduced) return;
    this.#timer = window.setInterval(() => this.#advance(), RoleTicker.INTERVAL_MS);
  }

  #advance() {
    this.#index = (this.#index + 1) % this.#phrases.length;
    this.#scramble.play(this.#phrases[this.#index]);
  }
}
