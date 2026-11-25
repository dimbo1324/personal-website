import { motion } from "../../core/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface SplitFlapOptions {
  readonly steps?: number;
}

/** Split-flap ("departure board") letter that ticks through random glyphs. */
export class SplitFlap {
  static readonly TICK_MS = 62;

  readonly #element: HTMLElement;
  readonly #final: string;
  readonly steps: number;
  #timer = 0;

  constructor(element: HTMLElement, { steps = 8 }: SplitFlapOptions = {}) {
    this.#element = element;
    this.#final = element.textContent ?? "";
    this.steps = steps;
  }

  spin(): Promise<void> {
    this.cancel();
    if (motion.reduced) return Promise.resolve();

    let step = 0;
    this.#element.classList.add("is-scrambling");
    return new Promise((resolve) => {
      this.#timer = window.setInterval(() => {
        step += 1;
        const landed = step >= this.steps;
        this.#element.textContent = landed
          ? this.#final
          : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        this.#flip();
        if (landed) {
          this.cancel();
          resolve();
        }
      }, SplitFlap.TICK_MS);
    });
  }

  cancel(): void {
    window.clearInterval(this.#timer);
    this.#timer = 0;
    this.#element.textContent = this.#final;
    this.#element.classList.remove("is-scrambling");
  }

  #flip(): void {
    this.#element.animate(
      [
        { transform: "rotateX(0deg)" },
        { transform: "rotateX(-80deg)", offset: 0.45 },
        { transform: "rotateX(0deg)" },
      ],
      { duration: SplitFlap.TICK_MS + 20, easing: "ease-out" },
    );
  }
}
