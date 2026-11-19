import { SafeStorage } from "../../core/SafeStorage.js";

const META_COLORS = Object.freeze({ dark: "#0a1114", light: "#f3f7f7" });

/**
 * Single source of truth for the colour theme.
 * Applies it to <html>, persists it and keeps <meta name="theme-color"> in sync.
 */
export class ThemeService {
  #store;
  #storage = new SafeStorage("dp");
  #meta = document.querySelector('meta[name="theme-color"]');

  /** @param {import("../../core/Store.js").Store} store */
  constructor(store) {
    this.#store = store;
  }

  /** Theme already applied by js/boot/theme-preload.js */
  static readInitial() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  get current() {
    return this.#store.get("theme");
  }

  get next() {
    return this.current === "dark" ? "light" : "dark";
  }

  start() {
    return this.#store.subscribe("theme", (theme) => this.#apply(theme));
  }

  set(theme) {
    this.#store.set("theme", theme);
  }

  #apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.#meta?.setAttribute("content", META_COLORS[theme]);
    this.#storage.write("theme", theme);
  }
}
