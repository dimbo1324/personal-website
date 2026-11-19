import { Component } from "../../core/Component.js";
import { lockScroll, unlockScroll } from "../../core/scrollLock.js";

/** Burger button + full-screen drawer. Closes on link click and Escape. */
export class MobileMenu extends Component {
  #drawer;
  #open = false;

  /** @param {HTMLButtonElement} root @param {HTMLElement} drawer */
  constructor(root, drawer) {
    super(root);
    this.#drawer = drawer;
  }

  mount() {
    this.on(this.root, "click", () => this.#set(!this.#open));
    this.#drawer.querySelectorAll("a").forEach((link) => this.on(link, "click", () => this.#set(false)));
    this.on(document, "keydown", (event) => {
      if (event.key === "Escape" && this.#open) this.#set(false);
    });
    return super.mount();
  }

  #set(open) {
    if (open === this.#open) return;
    this.#open = open;
    this.root.setAttribute("aria-expanded", String(open));
    this.root.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    this.#drawer.classList.toggle("is-open", open);
    this.#drawer.setAttribute("aria-hidden", String(!open));
    if (open) lockScroll();
    else unlockScroll();
  }
}
