/** "123 / 1000" counter under a textarea; turns amber near the limit. */
export class CharacterCounter {
  static readonly WARN_RATIO = 0.9;

  readonly #input: HTMLTextAreaElement;
  readonly #output: HTMLElement;
  readonly #limit: number;
  readonly #format: (value: number) => string;

  constructor(
    input: HTMLTextAreaElement,
    output: HTMLElement,
    limit: number,
    format: (value: number) => string = String,
  ) {
    this.#input = input;
    this.#output = output;
    this.#limit = limit;
    this.#format = format;
  }

  update(): void {
    const length = this.#input.value.length;
    this.#output.textContent = `${this.#format(length)} / ${this.#format(this.#limit)}`;
    this.#output.classList.toggle(
      "is-near-limit",
      length >= this.#limit * CharacterCounter.WARN_RATIO,
    );
  }
}
