import { Component } from "../../core/component";
import type { Store } from "../../core/store";
import type { AppState } from "../../app/state";
import type { I18nService } from "../../i18n/service";
import type { ScrollSpy } from "./ScrollSpy";

interface NavLinksOptions {
  readonly links: readonly HTMLAnchorElement[];
  readonly indicator: HTMLElement | null;
  readonly spy: ScrollSpy;
  readonly store: Store<AppState>;
  readonly i18n: I18nService;
}

/**
 * Highlights the active link in both the desktop nav and the mobile drawer,
 * and moves the sliding pill indicator under the active desktop link.
 */
export class NavLinks extends Component<HTMLElement> {
  readonly #links: readonly HTMLAnchorElement[];
  readonly #indicator: HTMLElement | null;
  readonly #spy: ScrollSpy;
  readonly #store: Store<AppState>;
  readonly #i18n: I18nService;

  constructor(root: HTMLElement, { links, indicator, spy, store, i18n }: NavLinksOptions) {
    super(root);
    this.#links = links;
    this.#indicator = indicator;
    this.#spy = spy;
    this.#store = store;
    this.#i18n = i18n;
  }

  override mount(): this {
    for (const link of this.#links) {
      this.on(link, "click", () => this.#spy.navigateTo(link.dataset.nav));
    }
    this.own(this.#store.subscribe("activeSection", (id) => this.#render(id)));
    this.on(window, "resize", () => this.#placeIndicator(this.#store.get("activeSection")), {
      passive: true,
    });
    document.fonts?.ready.then(() => this.#placeIndicator(this.#store.get("activeSection")));
    // Translated labels change the link widths.
    this.own(
      this.#i18n.subscribe(
        () => {
          requestAnimationFrame(() => this.#placeIndicator(this.#store.get("activeSection")));
        },
        { immediate: false },
      ),
    );
    return super.mount();
  }

  #render(id: string): void {
    for (const link of this.#links) {
      const active = link.dataset.nav === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    this.#placeIndicator(id);
  }

  #placeIndicator(id: string): void {
    if (!this.#indicator) return;
    const link = this.root.querySelector<HTMLElement>(`.site-nav__link[data-nav="${id}"]`);
    if (!link || link.offsetWidth === 0) return;
    const navRect = this.root.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    this.#indicator.style.width = `${linkRect.width}px`;
    this.#indicator.style.transform = `translateX(${linkRect.left - navRect.left - 1}px)`;
    this.#indicator.classList.add("is-ready");
  }
}
