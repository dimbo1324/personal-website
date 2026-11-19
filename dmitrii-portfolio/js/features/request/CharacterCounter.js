/** "123 / 1000" counter under a textarea; turns amber near the limit. */
export class CharacterCounter {
  static WARN_RATIO = 0.9;

  #input;
  #output;
  #limit;

  /** @param {HTMLTextAreaElement} input @param {HTMLElement} output @param {number} limit */
  constructor(input, output, limit) {
    this.#input = input;
    this.#output = output;
    this.#limit = limit;
  }

  update() {
    const length = this.#input.value.length;
    this.#output.textContent = `${length} / ${this.#limit}`;
    this.#output.classList.toggle("is-near-limit", length >= this.#limit * CharacterCounter.WARN_RATIO);
  }
}
