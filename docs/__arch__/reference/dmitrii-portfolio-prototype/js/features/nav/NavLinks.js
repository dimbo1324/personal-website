import { Component } from "../../core/Component.js";

/**
 * Highlights the active link in both the desktop nav and the mobile drawer,
 * and moves the sliding pill indicator under the active desktop link.
 */
export class NavLinks extends Component {
  #links;
  #indicator;
  #spy;

  /**
   * @param {HTMLElement} root  the desktop <nav>
   * @param {{ links: HTMLAnchorElement[], indicator: HTMLElement|null, spy: import("./ScrollSpy.js").ScrollSpy,
   *           store: import("../../core/Store.js").Store, i18n: import("../../i18n/I18nService.js").I18nService }} options
   */
  constructor(root, { links, indicator, spy, store, i18n }) {
    super(root);
    this.i18n = i18n;
    this.#links = links;
    this.#indicator = indicator;
    this.#spy = spy;
    this.store = store;
  }

  mount() {
    this.#links.forEach((link) => {
      this.on(link, "click", () => this.#spy.navigateTo(link.dataset.nav));
    });
    this.own(this.store.subscribe("activeSection", (id) => this.#render(id)));
    this.on(window, "resize", () => this.#placeIndicator(this.store.get("activeSection")), { passive: true });
    document.fonts?.ready.then(() => this.#placeIndicator(this.store.get("activeSection")));
    // translated labels change the link widths
    this.own(
      this.i18n.subscribe(() => requestAnimationFrame(() => this.#placeIndicator(this.store.get("activeSection"))), {
        immediate: false,
      }),
    );
    return super.mount();
  }

  #render(id) {
    this.#links.forEach((link) => {
      const active = link.dataset.nav === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    this.#placeIndicator(id);
  }

  #placeIndicator(id) {
    if (!this.#indicator) return;
    /** @type {HTMLElement | null} */
    const link = this.root.querySelector(`.site-nav__link[data-nav="${id}"]`);
    if (!link || link.offsetWidth === 0) return;
    const navRect = this.root.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    this.#indicator.style.width = `${linkRect.width}px`;
    this.#indicator.style.transform = `translateX(${linkRect.left - navRect.left - 1}px)`;
    this.#indicator.classList.add("is-ready");
  }
}
