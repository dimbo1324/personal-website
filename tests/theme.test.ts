// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/scripts/site/core/store";
import type { AppState } from "../src/scripts/site/app/state";
import { ThemeService } from "../src/scripts/site/features/theme/ThemeService";
import { ThemeToggle } from "../src/scripts/site/features/theme/ThemeToggle";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody, stubMatchMedia } from "./helpers/dom";

const dictionaries = { en, es, ru };
const i18n = new I18nService({ dictionaries, initial: "en" });
let store: Store<AppState>;
let theme: ThemeService;

beforeEach(() => {
  document.documentElement.setAttribute("data-theme", "dark");
  const meta = document.createElement("meta");
  meta.setAttribute("name", "theme-color");
  document.head.append(meta);
  localStorage.clear();
  stubMatchMedia(false);
  store = new Store<AppState>({
    theme: ThemeService.readInitial(),
    activeSection: "overview",
    heroScene: 0,
    simRunning: true,
    cycle: 1,
    widgetState: "closed",
    widgetMaximized: false,
  });
  theme = new ThemeService(store);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.querySelector('meta[name="theme-color"]')?.remove();
  localStorage.clear();
});

describe("ThemeService", () => {
  it("reads the pre-paint theme and starts in sync", () => {
    expect(ThemeService.readInitial()).toBe("dark");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) throw new Error("missing fixture");

    const unsubscribe = theme.start();
    theme.set("light");
    expect(store.get("theme")).toBe("light");
    expect(theme.current).toBe("light");
    expect(theme.next).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(meta.content).toBe("#f3f7f7");
    expect(localStorage.getItem("dp.theme")).toBe("light");
    unsubscribe();
    meta.remove();
  });

  it("recognises the light initial theme", () => {
    document.documentElement.setAttribute("data-theme", "light");
    expect(ThemeService.readInitial()).toBe("light");
  });
});

describe("ThemeToggle", () => {
  it("switches the theme from a click and updates its label", () => {
    setBody('<button data-js="theme-toggle"></button>');
    const root = document.querySelector<HTMLButtonElement>("[data-js=theme-toggle]");
    if (!root) throw new Error("missing fixture");
    theme.start();
    i18n.set("en");

    const toggle = new ThemeToggle(root, theme, store, i18n).mount();
    expect(root.getAttribute("aria-label")).toBe(en["theme.toLight"]);

    root.click();
    expect(store.get("theme")).toBe("light");
    expect(root.getAttribute("aria-label")).toBe(en["theme.toDark"]);
    expect(root.classList.contains("is-switching")).toBe(true);
    expect(root.classList.contains("is-to-light")).toBe(true);

    toggle.destroy();
  });
});
