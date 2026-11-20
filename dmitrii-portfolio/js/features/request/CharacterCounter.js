/** "123 / 1000" counter under a textarea; turns amber near the limit. */
export class CharacterCounter {
  static WARN_RATIO = 0.9;

  #input;
  #output;
  #limit;
  #format;

  /**
   * @param {HTMLTextAreaElement} input @param {HTMLElement} output @param {number} limit
   * @param {(value: number) => string} [format]  locale-aware number formatting
   */
  constructor(input, output, limit, format = String) {
    this.#input = input;
    this.#output = output;
    this.#limit = limit;
    this.#format = format;
  }

  update() {
    const length = this.#input.value.length;
    this.#output.textContent = `${this.#format(length)} / ${this.#format(this.#limit)}`;
    this.#output.classList.toggle("is-near-limit", length >= this.#limit * CharacterCounter.WARN_RATIO);
  }
}
