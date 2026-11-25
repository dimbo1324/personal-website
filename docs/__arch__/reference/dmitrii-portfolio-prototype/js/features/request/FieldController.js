/**
 * One form field: reads its value and renders its error state accessibly
 * (aria-invalid + message linked via aria-describedby in the markup).
 * Keeps the current issue (not its text), so it can re-render in another language.
 */
export class FieldController {
  /** @type {HTMLInputElement} */
  #control;
  #error;
  #translate;
  #issue = null;
  #touched = false;

  /**
   * @param {HTMLElement} wrapper  element with [data-field]
   * @param {(issue: import("./validationIssue.js").ValidationIssue) => string} translate
   */
  constructor(wrapper, translate) {
    this.name = wrapper.dataset.field;
    this.#control = wrapper.querySelector("input, textarea, select");
    this.#error = wrapper.querySelector("[data-field-error]");
    this.#translate = translate;
  }

  get control() {
    return this.#control;
  }

  get value() {
    return this.#control.type === "checkbox" ? this.#control.checked : this.#control.value;
  }

  set value(next) {
    if (this.#control.type === "checkbox") this.#control.checked = Boolean(next);
    else this.#control.value = String(next ?? "");
  }

  get touched() {
    return this.#touched;
  }

  touch() {
    this.#touched = true;
  }

  /** @param {import("./validationIssue.js").ValidationIssue | null} problem */
  render(problem) {
    this.#issue = problem;
    this.#control.setAttribute("aria-invalid", String(Boolean(problem)));
    this.refresh();
  }

  /** Re-translates the current message (after a language switch). */
  refresh() {
    if (this.#error) this.#error.textContent = this.#issue ? this.#translate(this.#issue) : "";
  }

  reset() {
    this.#touched = false;
    this.render(null);
  }

  focus() {
    this.#control.focus();
  }
}
