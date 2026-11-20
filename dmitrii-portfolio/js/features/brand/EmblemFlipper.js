import { motion } from "../../core/MotionPreference.js";

/**
 * Turns the two-sided brand card over (front: DP, back: avatar).
 * Auto mode: every INTERVAL the avatar is shown for HOLD, then the card
 * returns to DP. Auto-flipping pauses while the pointer is on the brand,
 * while the tab is hidden, and is disabled for reduced motion.
 */
export class EmblemFlipper {
  #root;
  #intervalMs;
  #holdMs;
  #flipped = false;
  #paused = false;
  #cycleTimer = 0;
  #holdTimer = 0;
  #onChange;

  /**
   * @param {HTMLElement} root the .brand element (receives .is-flipped)
   * @param {{ onChange?: (flipped: boolean) => void, intervalMs?: number, holdMs?: number }} [options]
   */
  constructor(root, { onChange, intervalMs = 19000, holdMs = 3600 } = {}) {
    this.#root = root;
    this.#onChange = onChange;
    this.#intervalMs = intervalMs;
    this.#holdMs = holdMs;
  }

  get flipped() {
    return this.#flipped;
  }

  /** @param {boolean} flipped */
  set(flipped) {
    if (flipped === this.#flipped) return;
    this.#flipped = flipped;
    this.#root.classList.toggle("is-flipped", flipped);
    this.#onChange?.(flipped);
  }

  toggle() {
    this.set(!this.#flipped);
    this.#restartAuto(); // a manual flip resets the auto rhythm
  }

  startAuto() {
    if (motion.reduced) return;
    this.#restartAuto();
  }

  pause() {
    this.#paused = true;
  }

  resume() {
    this.#paused = false;
  }

  stop() {
    clearTimeout(this.#cycleTimer);
    clearTimeout(this.#holdTimer);
  }

  #restartAuto() {
    this.stop();
    if (motion.reduced) return;
    this.#cycleTimer = window.setTimeout(() => this.#autoStep(), this.#intervalMs);
  }

  #autoStep() {
    if (this.#paused || document.hidden) {
      this.#restartAuto();
      return;
    }
    const showAvatar = !this.#flipped;
    this.set(showAvatar);
    if (showAvatar) {
      this.#holdTimer = window.setTimeout(() => {
        if (!this.#paused) this.set(false);
        this.#restartAuto();
      }, this.#holdMs);
    } else {
      this.#restartAuto();
    }
  }
}
