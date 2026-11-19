import { Component } from "../../core/Component.js";
import { motion } from "../../core/MotionPreference.js";
import { ThemeTransition } from "./ThemeTransition.js";

const LABELS = Object.freeze({
  dark: "Switch to light theme",
  light: "Switch to dark theme",
});

/**
 * The orb in the header. Owns its click choreography
 * (sunset → moonrise / moon flip → sunrise) and delegates the actual
 * switch to ThemeService + ThemeTransition.
 */
export class ThemeToggle extends Component {
  static CHOREOGRAPHY_MS = 1150;

  #themeService;
  #transition = new ThemeTransition();
  #timer = 0;

  /**
   * @param {HTMLButtonElement} root
   * @param {import("./ThemeService.js").ThemeService} themeService
   * @param {import("../../core/Store.js").Store} store
   */
  constructor(root, themeService, store) {
    super(root);
    this.#themeService = themeService;
    this.store = store;
  }

  mount() {
    this.on(this.root, "click", (event) => this.#toggle(event));
    this.own(this.store.subscribe("theme", (theme) => this.#syncLabel(theme)));
    return super.mount();
  }

  onDestroy() {
    clearTimeout(this.#timer);
  }

  #toggle(event) {
    const next = this.#themeService.next;
    this.#playChoreography(next === "light" ? "to-light" : "to-dark");
    this.#transition.run(() => this.#themeService.set(next), this.#originOf(event));
  }

  #originOf(event) {
    if (event.clientX > 0 || event.clientY > 0) return { x: event.clientX, y: event.clientY };
    const rect = this.root.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  #playChoreography(direction) {
    if (motion.reduced) return;
    const classes = ["is-switching", "is-to-light", "is-to-dark"];
    this.root.classList.remove(...classes);
    void this.root.offsetWidth; // restart CSS animations on rapid clicks
    this.root.classList.add("is-switching", `is-${direction}`);
    clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => this.root.classList.remove(...classes), ThemeToggle.CHOREOGRAPHY_MS);
  }

  #syncLabel(theme) {
    this.root.setAttribute("aria-label", LABELS[theme]);
    this.root.setAttribute("title", LABELS[theme]);
  }
}
