import { createElement } from "../core/dom";
import { createIcon } from "../core/icons";

export class Toast {
  static readonly DURATION_MS = 2400;

  readonly #element: HTMLElement;
  #timer = 0;

  constructor(element: HTMLElement) {
    this.#element = element;
  }

  show(message: string, icon = "check"): void {
    this.#element.replaceChildren(createIcon(icon, "sm"), createElement("span", { text: message }));
    this.#element.classList.add("is-visible");
    window.clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => {
      this.#element.classList.remove("is-visible");
    }, Toast.DURATION_MS);
  }
}
