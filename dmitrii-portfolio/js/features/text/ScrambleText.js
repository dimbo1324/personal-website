import { motion } from "../../core/MotionPreference.js";

const LATIN_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·—";
const CYRILLIC_GLYPHS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789";
const PRESERVED = new Set([" ", "·", "/", "&"]);

/**
 * "Decoder" text effect: characters resolve left-to-right out of random glyphs.
 * One instance per element; a new `play()` cancels the previous run.
 */
export class ScrambleText {
  #element;
  #timer = 0;
  #speed;

  /** @param {HTMLElement} element @param {{ speed?: number }} [options] */
  constructor(element, { speed = 22 } = {}) {
    this.#element = element;
    this.#speed = speed;
  }

  /** @param {string} target @returns {Promise<void>} */
  play(target) {
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
        for (let i = 0; i < length; i += 1) {
          const char = target[i];
          if (PRESERVED.has(char) || i < frame / 2) output += char;
          else output += glyphs[Math.floor(Math.random() * glyphs.length)];
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

  cancel() {
    window.clearInterval(this.#timer);
    this.#timer = 0;
  }
}
