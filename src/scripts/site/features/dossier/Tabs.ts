import { Component } from "../../core/component";

/**
 * WAI-ARIA tabs with a sliding thumb and roving tabindex
 * (← → Home End move between tabs).
 */
export class Tabs extends Component<HTMLElement> {
  readonly #panes: readonly HTMLElement[];
  #tabs: HTMLButtonElement[] = [];
  #indicator: HTMLElement | null = null;

  constructor(root: HTMLElement, panes: readonly HTMLElement[]) {
    super(root);
    this.#panes = panes;
  }

  override mount(): this {
    this.#tabs = Array.from(this.root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
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

  select(index: number, { focus = false }: { readonly focus?: boolean } = {}): void {
    this.#tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    const key = this.#tabs[index]?.dataset.tab;
    for (const pane of this.#panes) {
      const active = pane.dataset.pane === key;
      pane.hidden = !active;
      pane.classList.toggle("is-active", active);
    }
    this.#placeIndicator();
  }

  #onKey(event: KeyboardEvent, index: number): void {
    const last = this.#tabs.length - 1;
    const map: Readonly<Record<string, number>> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.select(next, { focus: true });
  }

  #placeIndicator(): void {
    const active = this.#tabs.find((tab) => tab.classList.contains("is-active"));
    if (!active || !this.#indicator) return;
    this.#indicator.style.width = `${active.offsetWidth}px`;
    this.#indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  }
}
