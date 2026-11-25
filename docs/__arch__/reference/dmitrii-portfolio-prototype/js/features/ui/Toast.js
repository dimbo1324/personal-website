import { createIcon } from "../../core/icons.js";
import { createElement } from "../../core/dom.js";

/** Non-blocking status message (role="status" in the markup). */
export class Toast {
  static DURATION_MS = 2400;

  #element;
  #timer = 0;

  /** @param {HTMLElement} element */
  constructor(element) {
    this.#element = element;
  }

  show(message, icon = "check") {
    this.#element.replaceChildren(createIcon(icon, "sm"), createElement("span", { text: message }));
    this.#element.classList.add("is-visible");
    clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => this.#element.classList.remove("is-visible"), Toast.DURATION_MS);
  }
}
