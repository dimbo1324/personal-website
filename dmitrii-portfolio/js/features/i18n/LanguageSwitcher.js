import { Component } from "../../core/Component.js";

/**
 * EN / ES / RU segmented switch in the header. The sliding indicator is
 * positioned by CSS from --lang-index; arrow keys move between options.
 */
export class LanguageSwitcher extends Component {
  #i18n;
  /** @type {HTMLButtonElement[]} */
  #buttons;
  #onChange;

  /**
   * @param {HTMLElement} root  [data-js="lang-switch"]
   * @param {{ i18n: import("../../i18n/I18nService.js").I18nService, onChange?: (lang: string) => void }} options
   */
  constructor(root, { i18n, onChange = () => {} }) {
    super(root);
    this.#i18n = i18n;
    this.#onChange = onChange;
    this.#buttons = /** @type {HTMLButtonElement[]} */ ([...root.querySelectorAll("[data-lang]")]);
  }

  mount() {
    this.#buttons.forEach((button) => {
      this.on(button, "click", () => this.#select(button.dataset.lang));
      this.on(button, "keydown", (event) => this.#onKey(event, button));
    });
    this.own(this.#i18n.subscribe((lang) => this.#render(lang)));
    return super.mount();
  }

  #select(lang) {
    if (lang === this.#i18n.lang) return;
    this.#i18n.set(lang);
    this.#onChange(lang);
  }

  #onKey(event, button) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = this.#buttons.indexOf(button);
    const next = this.#buttons[(index + step + this.#buttons.length) % this.#buttons.length];
    next.focus();
    this.#select(next.dataset.lang);
  }

  #render(lang) {
    this.#buttons.forEach((button, index) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      if (active) this.root.style.setProperty("--lang-index", String(index));
    });
  }
}
