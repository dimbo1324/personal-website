import { SafeStorage } from "../../core/storage";

export type Theme = "dark" | "light";

export interface ThemeStore {
  get(key: "theme"): Theme;
  set(key: "theme", value: Theme): void;
  subscribe(
    key: "theme",
    listener: (value: Theme, previous: Theme | undefined) => void,
    options?: { immediate?: boolean },
  ): () => void;
}

const META_COLORS: Readonly<Record<Theme, string>> = Object.freeze({
  dark: "#0a1114",
  light: "#f3f7f7",
});

/**
 * Single source of truth for the colour theme.
 * Applies it to <html>, persists it and keeps <meta name="theme-color"> in sync.
 */
export class ThemeService {
  readonly #store: ThemeStore;
  readonly #storage = new SafeStorage("dp");
  readonly #meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  constructor(store: ThemeStore) {
    this.#store = store;
  }

  /** Theme already applied by the inline pre-paint boot script. */
  static readInitial(): Theme {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  get current(): Theme {
    return this.#store.get("theme");
  }

  get next(): Theme {
    return this.current === "dark" ? "light" : "dark";
  }

  start(): () => void {
    return this.#store.subscribe("theme", (theme) => {
      this.#apply(theme);
    });
  }

  set(theme: Theme): void {
    this.#store.set("theme", theme);
  }

  #apply(theme: Theme): void {
    document.documentElement.setAttribute("data-theme", theme);
    this.#meta?.setAttribute("content", META_COLORS[theme]);
    this.#storage.write("theme", theme);
  }
}
