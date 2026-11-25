import { Component } from "../../core/Component.js";

/**
 * WAI-ARIA tabs with a sliding thumb and roving tabindex
 * (← → Home End move between tabs).
 */
export class Tabs extends Component {
  #tabs;
  #panes;
  #indicator;

  /** @param {HTMLElement} root [role=tablist] @param {HTMLElement[]} panes */
  constructor(root, panes) {
    super(root);
    this.#panes = panes;
  }

  mount() {
    this.#tabs = Array.from(this.root.querySelectorAll('[role="tab"]'));
    this.#indicator = this.root.querySelector(".segmented__indicator");

    this.#tabs.forEach((tab, index) => {
      this.on(tab, "click", () => this.select(index));
      this.on(tab, "keydown", (event) => this.#onKey(event, index));
    });
    this.on(window, "resize", () => this.#placeIndicator(), { passive: true });
    document.fonts?.ready.then(() => this.#placeIndicator());
    this.#placeIndicator();
    return super.mount();
  }

  select(index, { focus = false } = {}) {
    this.#tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    const key = this.#tabs[index].dataset.tab;
    this.#panes.forEach((pane) => {
      const active = pane.dataset.pane === key;
      pane.hidden = !active;
      pane.classList.toggle("is-active", active);
    });
    this.#placeIndicator();
  }

  #onKey(event, index) {
    const last = this.#tabs.length - 1;
    const map = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last };
    if (!(event.key in map)) return;
    event.preventDefault();
    this.select(map[event.key], { focus: true });
  }

  #placeIndicator() {
    const active = this.#tabs.find((tab) => tab.classList.contains("is-active"));
    if (!active || !this.#indicator) return;
    this.#indicator.style.width = `${active.offsetWidth}px`;
    this.#indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  }
}
