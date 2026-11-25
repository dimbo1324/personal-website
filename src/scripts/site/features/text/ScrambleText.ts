import { motion } from "../../core/motion";

const LATIN_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·—";
const CYRILLIC_GLYPHS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789";
const PRESERVED = new Set([" ", "·", "/", "&"]);

interface ScrambleOptions {
  readonly speed?: number;
}

/** "Decoder" text effect: characters resolve left-to-right out of random glyphs. */
export class ScrambleText {
  readonly #element: HTMLElement;
  readonly #speed: number;
  #timer = 0;

  constructor(element: HTMLElement, { speed = 22 }: ScrambleOptions = {}) {
    this.#element = element;
    this.#speed = speed;
  }

  play(target: string): Promise<void> {
    this.cancel();
    if (motion.reduced) {
      this.#element.textContent = target;
      return Promise.resolve();
    }

    const glyphs = /[А-Яа-яЁё]/.test(target) ? CYRILLIC_GLYPHS : LATIN_GLYPHS;
    const length = target.length;
    let frame = 0;

    return new Promise((resolve) => {
      this.#timer = window.setInterval(() => {
        let output = "";
        for (let index = 0; index < length; index += 1) {
          const char = target.charAt(index);
          const glyph = glyphs.charAt(Math.floor(Math.random() * glyphs.length));
          output += PRESERVED.has(char) || index < frame / 2 ? char : glyph;
        }
        this.#element.textContent = output;
        frame += 1;
        if (frame > length * 2 + 2) {
          this.cancel();
          this.#element.textContent = target;
          resolve();
        }
      }, this.#speed);
    });
  }

  cancel(): void {
    window.clearInterval(this.#timer);
    this.#timer = 0;
  }
}
