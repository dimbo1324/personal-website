import type { Store } from "../../core/store";
import type { AppState } from "../../app/state";
import { motion } from "../../core/motion";
import { Component } from "../../core/component";
import type { I18nService } from "../../i18n/service";
import { ThemeTransition } from "./ThemeTransition";
import type { ThemeService } from "./ThemeService";

/**
 * The orb in the header. Owns its click choreography
 * (sunset → moonrise / moon flip → sunrise) and delegates the actual
 * switch to ThemeService + ThemeTransition.
 */
export class ThemeToggle extends Component<HTMLButtonElement> {
  static readonly CHOREOGRAPHY_MS = 1150;

  readonly #themeService: ThemeService;
  readonly #transition = new ThemeTransition();
  #timer = 0;
  readonly #store: Store<AppState>;
  readonly #i18n: I18nService;

  constructor(
    root: HTMLButtonElement,
    themeService: ThemeService,
    store: Store<AppState>,
    i18n: I18nService,
  ) {
    super(root);
    this.#themeService = themeService;
    this.#store = store;
    this.#i18n = i18n;
  }

  override mount(): this {
    this.on(this.root, "click", (event) => this.#toggle(event));
    this.own(this.#store.subscribe("theme", () => this.#syncLabel()));
    this.own(this.#i18n.subscribe(() => this.#syncLabel(), { immediate: false }));
    return super.mount();
  }

  protected override onDestroy(): void {
    window.clearTimeout(this.#timer);
  }

  #toggle(event: MouseEvent): void {
    const next = this.#themeService.next;
    this.#playChoreography(next === "light" ? "to-light" : "to-dark");
    this.#transition.run(() => this.#themeService.set(next), this.#originOf(event));
  }

  #originOf(event: MouseEvent): { readonly x: number; readonly y: number } {
    if (event.clientX > 0 || event.clientY > 0) return { x: event.clientX, y: event.clientY };
    const rect = this.root.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  #playChoreography(direction: "to-light" | "to-dark"): void {
    if (motion.reduced) return;
    const classes = ["is-switching", "is-to-light", "is-to-dark"];
    this.root.classList.remove(...classes);
    void this.root.offsetWidth;
    this.root.classList.add("is-switching", `is-${direction}`);
    window.clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => {
      this.root.classList.remove(...classes);
    }, ThemeToggle.CHOREOGRAPHY_MS);
  }

  #syncLabel(): void {
    const label = this.#i18n.t(
      this.#store.get("theme") === "dark" ? "theme.toLight" : "theme.toDark",
    );
    this.root.setAttribute("aria-label", label);
    this.root.setAttribute("title", label);
  }
}
