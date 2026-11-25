import { Component } from "../../core/component";
import { lockScroll, unlockScroll } from "../../core/scroll-lock";
import type { I18nService } from "../../i18n/service";

/** Burger button + full-screen drawer. Closes on link click and Escape. */
export class MobileMenu extends Component<HTMLButtonElement> {
  readonly #drawer: HTMLElement;
  readonly #i18n: I18nService;
  #open = false;

  constructor(root: HTMLButtonElement, drawer: HTMLElement, i18n: I18nService) {
    super(root);
    this.#drawer = drawer;
    this.#i18n = i18n;
  }

  override mount(): this {
    this.on(this.root, "click", () => this.#set(!this.#open));
    for (const link of Array.from(this.#drawer.querySelectorAll("a"))) {
      this.on(link, "click", () => this.#set(false));
    }
    this.on(document, "keydown", (event) => {
      if (event.key === "Escape" && this.#open) this.#set(false);
    });
    this.own(this.#i18n.subscribe(() => this.#syncLabel()));
    return super.mount();
  }

  #syncLabel(): void {
    this.root.setAttribute("aria-label", this.#i18n.t(this.#open ? "menu.close" : "menu.open"));
  }

  #set(open: boolean): void {
    if (open === this.#open) return;
    this.#open = open;
    this.root.setAttribute("aria-expanded", String(open));
    this.#syncLabel();
    this.#drawer.classList.toggle("is-open", open);
    this.#drawer.setAttribute("aria-hidden", String(!open));
    if (open) lockScroll();
    else unlockScroll();
  }
}
