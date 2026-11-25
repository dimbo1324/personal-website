import { motion } from "../../core/motion";

interface EmblemFlipperOptions {
  readonly onChange?: (flipped: boolean) => void;
  readonly intervalMs?: number;
  readonly holdMs?: number;
}

/**
 * Turns the two-sided brand card over (front: DP, back: avatar).
 * Auto-flipping pauses while the pointer is on the brand, while the tab is
 * hidden, and is disabled for reduced motion.
 */
export class EmblemFlipper {
  readonly #root: HTMLElement;
  readonly #onChange: ((flipped: boolean) => void) | undefined;
  readonly #intervalMs: number;
  readonly #holdMs: number;
  #flipped = false;
  #paused = false;
  #cycleTimer = 0;
  #holdTimer = 0;

  constructor(
    root: HTMLElement,
    { onChange, intervalMs = 19000, holdMs = 3600 }: EmblemFlipperOptions = {},
  ) {
    this.#root = root;
    this.#onChange = onChange;
    this.#intervalMs = intervalMs;
    this.#holdMs = holdMs;
  }

  get flipped(): boolean {
    return this.#flipped;
  }

  set(flipped: boolean): void {
    if (flipped === this.#flipped) return;
    this.#flipped = flipped;
    this.#root.classList.toggle("is-flipped", flipped);
    this.#onChange?.(flipped);
  }

  toggle(): void {
    this.set(!this.#flipped);
    this.#restartAuto();
  }

  startAuto(): void {
    if (motion.reduced) return;
    this.#restartAuto();
  }

  pause(): void {
    this.#paused = true;
  }

  resume(): void {
    this.#paused = false;
  }

  stop(): void {
    window.clearTimeout(this.#cycleTimer);
    window.clearTimeout(this.#holdTimer);
  }

  #restartAuto(): void {
    this.stop();
    if (motion.reduced) return;
    this.#cycleTimer = window.setTimeout(() => this.#autoStep(), this.#intervalMs);
  }

  #autoStep(): void {
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
