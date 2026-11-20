import { Component } from "../../core/Component.js";
import { lockScroll, unlockScroll } from "../../core/scrollLock.js";

/** Burger button + full-screen drawer. Closes on link click and Escape. */
export class MobileMenu extends Component {
  #drawer;
  #open = false;

  #i18n;

  /**
   * @param {HTMLButtonElement} root @param {HTMLElement} drawer
   * @param {import("../../i18n/I18nService.js").I18nService} i18n
   */
  constructor(root, drawer, i18n) {
    super(root);
    this.#drawer = drawer;
    this.#i18n = i18n;
  }

  mount() {
    this.on(this.root, "click", () => this.#set(!this.#open));
    this.#drawer.querySelectorAll("a").forEach((link) => this.on(link, "click", () => this.#set(false)));
    this.on(document, "keydown", (event) => {
      if (event.key === "Escape" && this.#open) this.#set(false);
    });
    this.own(this.#i18n.subscribe(() => this.#syncLabel()));
    return super.mount();
  }

  #syncLabel() {
    this.root.setAttribute("aria-label", this.#i18n.t(this.#open ? "menu.close" : "menu.open"));
  }

  #set(open) {
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
