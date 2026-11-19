/**
 * One form field: reads its value and renders its error state accessibly
 * (aria-invalid + message linked via aria-describedby in the markup).
 */
export class FieldController {
  #control;
  #error;
  #touched = false;

  /** @param {HTMLElement} wrapper  element with [data-field] */
  constructor(wrapper) {
    this.name = wrapper.dataset.field;
    this.#control = wrapper.querySelector("input, textarea, select");
    this.#error = wrapper.querySelector("[data-field-error]");
  }

  get control() {
    return this.#control;
  }

  get value() {
    return this.#control.type === "checkbox" ? this.#control.checked : this.#control.value;
  }

  set value(next) {
    if (this.#control.type === "checkbox") this.#control.checked = Boolean(next);
    else this.#control.value = next ?? "";
  }

  get touched() {
    return this.#touched;
  }

  touch() {
    this.#touched = true;
  }

  /** @param {string|null} message */
  render(message) {
    const invalid = Boolean(message);
    this.#control.setAttribute("aria-invalid", String(invalid));
    if (this.#error) this.#error.textContent = message ?? "";
  }

  reset() {
    this.#touched = false;
    this.render(null);
  }

  focus() {
    this.#control.focus();
  }
}
