import type { ValidationIssue } from "./validationIssue";
import type { FieldValue } from "./validators";

/** One form field: reads its value and renders its error state accessibly. */
export class FieldController {
  readonly name: string | undefined;
  readonly #control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  readonly #error: Element | null;
  readonly #translate: (issue: ValidationIssue) => string;
  #issue: ValidationIssue | null = null;
  #touched = false;

  constructor(wrapper: HTMLElement, translate: (issue: ValidationIssue) => string) {
    this.name = wrapper.dataset.field;
    const control = wrapper.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select");
    if (!control) throw new TypeError("FieldController: control element is required");
    this.#control = control;
    this.#error = wrapper.querySelector("[data-field-error]");
    this.#translate = translate;
  }

  get control(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
    return this.#control;
  }

  get value(): FieldValue {
    return this.#control instanceof HTMLInputElement && this.#control.type === "checkbox"
      ? this.#control.checked
      : this.#control.value;
  }

  set value(next: FieldValue) {
    if (this.#control instanceof HTMLInputElement && this.#control.type === "checkbox") {
      this.#control.checked = Boolean(next);
    } else {
      this.#control.value = String(next ?? "");
    }
  }

  get touched(): boolean {
    return this.#touched;
  }

  touch(): void {
    this.#touched = true;
  }

  render(problem: ValidationIssue | null): void {
    this.#issue = problem;
    this.#control.setAttribute("aria-invalid", String(Boolean(problem)));
    this.refresh();
  }

  refresh(): void {
    if (this.#error) this.#error.textContent = this.#issue ? this.#translate(this.#issue) : "";
  }

  reset(): void {
    this.#touched = false;
    this.render(null);
  }

  focus(): void {
    this.#control.focus();
  }
}
