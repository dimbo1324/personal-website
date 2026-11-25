import { Component } from "../../core/component";
import type { I18nService } from "../../i18n/service";
import type { Language } from "../../i18n/languages";

interface LanguageSwitcherOptions {
  readonly i18n: I18nService;
  readonly onChange?: (lang: Language) => void;
}

/**
 * EN / ES / RU segmented switch in the header. The sliding indicator is
 * positioned by CSS from --lang-index; arrow keys move between options.
 */
export class LanguageSwitcher extends Component<HTMLElement> {
  readonly #i18n: I18nService;
  readonly #buttons: HTMLButtonElement[];
  readonly #onChange: (lang: Language) => void;

  constructor(
    root: HTMLElement,
    { i18n, onChange = (): void => undefined }: LanguageSwitcherOptions,
  ) {
    super(root);
    this.#i18n = i18n;
    this.#onChange = onChange;
    this.#buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-lang]"));
  }

  override mount(): this {
    for (const button of this.#buttons) {
      this.on(button, "click", () => this.#select(button.dataset.lang));
      this.on(button, "keydown", (event) => this.#onKey(event, button));
    }
    this.own(this.#i18n.subscribe((lang) => this.#render(lang)));
    return super.mount();
  }

  #select(lang: string | undefined): void {
    if (!this.#isLanguage(lang) || lang === this.#i18n.lang) return;
    this.#i18n.set(lang);
    this.#onChange(lang);
  }

  #isLanguage(value: string | undefined): value is Language {
    return value === "en" || value === "es" || value === "ru";
  }

  #onKey(event: KeyboardEvent, button: HTMLButtonElement): void {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = this.#buttons.indexOf(button);
    const next = this.#buttons.at((index + step + this.#buttons.length) % this.#buttons.length);
    if (!next) return;
    next.focus();
    this.#select(next.dataset.lang);
  }

  #render(lang: Language): void {
    this.#buttons.forEach((button, index) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      if (active) this.root.style.setProperty("--lang-index", String(index));
    });
  }
}
