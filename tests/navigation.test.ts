// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Store } from "../src/scripts/site/core/store";
import type { AppState } from "../src/scripts/site/app/state";
import type { ScrollService, ScrollState } from "../src/scripts/site/features/scroll/ScrollService";
import { ScrollSpy } from "../src/scripts/site/features/nav/ScrollSpy";
import { MobileMenu } from "../src/scripts/site/features/nav/MobileMenu";
import { NavLinks } from "../src/scripts/site/features/nav/NavLinks";
import { ScrollTopButton } from "../src/scripts/site/features/scroll/ScrollTopButton";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
let store: Store<AppState>;

type FakeScroll = ScrollService & { set(next: ScrollState): void };

function fakeScroll(state: ScrollState): FakeScroll {
  let listener: ((value: ScrollState) => void) | null = null;
  return {
    get state() {
      return state;
    },
    subscribe(callback: (value: ScrollState) => void): () => void {
      listener = callback;
      callback(state);
      return () => {
        listener = null;
      };
    },
    set(next: ScrollState): void {
      Object.assign(state, next);
      listener?.(state);
    },
  } as unknown as FakeScroll;
}

function rect(top: number): DOMRect {
  return {
    top,
    left: 0,
    width: 100,
    height: 40,
    bottom: top + 40,
    right: 100,
    x: 0,
    y: top,
  } as DOMRect;
}

beforeEach(() => {
  store = new Store<AppState>({
    theme: "dark",
    activeSection: "overview",
    heroScene: 0,
    simRunning: true,
    cycle: 1,
    widgetState: "closed",
    widgetMaximized: false,
  });
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.className = "";
  document.body.innerHTML = "";
});

describe("ScrollSpy", () => {
  it("marks the first section near the top and the last one at the bottom", () => {
    setBody(
      '<section id="overview"></section><section id="cases"></section><section id="request"></section>',
    );
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section"));
    const state: ScrollState = { y: 0, progress: 0, viewportHeight: 800 };
    const scroll = fakeScroll(state);
    const spy = new ScrollSpy(sections, store, scroll, { aliases: { request: "contact" } });
    spy.start();

    expect(store.get("activeSection")).toBe("overview");
    scroll.set({ y: 400, progress: 0.5, viewportHeight: 800 });
    expect(store.get("activeSection")).toBe("contact");
  });

  it("uses the section above the trigger line and resolves nav aliases", () => {
    setBody(
      '<section id="overview"></section><section id="cases"></section><section id="request"></section>',
    );
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section"));
    vi.spyOn(sections[1] as HTMLElement, "getBoundingClientRect").mockReturnValue(rect(100));
    vi.spyOn(sections[2] as HTMLElement, "getBoundingClientRect").mockReturnValue(rect(600));
    const scroll = fakeScroll({ y: 200, progress: 0.2, viewportHeight: 800 });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 5000,
    });

    const spy = new ScrollSpy(sections, store, scroll, { aliases: { request: "contact" } });
    spy.start();
    expect(store.get("activeSection")).toBe("cases");

    spy.navigateTo("request");
    expect(store.get("activeSection")).toBe("contact");
  });
});

describe("MobileMenu", () => {
  it("opens and closes the drawer with scroll locking", () => {
    setBody(
      '<button data-js="menu-toggle"></button><nav data-js="drawer"><a href="#cases"></a></nav>',
    );
    const button = document.querySelector<HTMLButtonElement>("[data-js=menu-toggle]");
    const drawer = document.querySelector<HTMLElement>("[data-js=drawer]");
    if (!button || !drawer) throw new Error("missing fixtures");

    new MobileMenu(button, drawer, i18n).mount();
    button.click();
    expect(drawer.classList.contains("is-open")).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.classList.contains("is-scroll-locked")).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(drawer.classList.contains("is-open")).toBe(false);
    expect(document.body.classList.contains("is-scroll-locked")).toBe(false);
  });

  it("closes on a drawer link click", () => {
    setBody(
      '<button data-js="menu-toggle"></button><nav data-js="drawer"><a href="#cases"></a></nav>',
    );
    const button = document.querySelector<HTMLButtonElement>("[data-js=menu-toggle]");
    const drawer = document.querySelector<HTMLElement>("[data-js=drawer]");
    if (!button || !drawer) throw new Error("missing fixtures");
    new MobileMenu(button, drawer, i18n).mount();

    button.click();
    drawer.querySelector("a")?.click();
    expect(drawer.classList.contains("is-open")).toBe(false);
  });
});

describe("NavLinks", () => {
  it("marks the active link and delegates clicks to the spy", () => {
    setBody(`
      <nav class="site-nav"><span class="site-nav__indicator"></span>
        <a data-nav="overview" class="site-nav__link is-active"></a>
        <a data-nav="cases" class="site-nav__link"></a>
      </nav>
    `);
    const root = document.querySelector<HTMLElement>(".site-nav");
    if (!root) throw new Error("missing fixture");
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("a"));
    const spy = { navigateTo: vi.fn() } as unknown as ScrollSpy;
    const scroll = fakeScroll({ y: 0, progress: 0, viewportHeight: 800 });
    void scroll;

    new NavLinks(root, {
      links,
      indicator: root.querySelector<HTMLElement>(".site-nav__indicator"),
      spy,
      store,
      i18n,
    }).mount();

    store.set("activeSection", "cases");
    expect(links[0]?.hasAttribute("aria-current")).toBe(false);
    expect(links[1]?.getAttribute("aria-current")).toBe("true");
    links[1]?.click();
    expect(spy.navigateTo).toHaveBeenCalledWith("cases");
  });
});

describe("ScrollTopButton", () => {
  it("shows itself past the threshold and scrolls to the top", () => {
    setBody('<button data-js="top"><svg><circle data-js="ring" r="24"></circle></svg></button>');
    const button = document.querySelector<HTMLButtonElement>("[data-js=top]");
    const ring = document.querySelector<SVGCircleElement>("[data-js=ring]");
    if (!button || !ring) throw new Error("missing fixtures");
    const scroll = fakeScroll({ y: 0, progress: 0, viewportHeight: 800 });

    new ScrollTopButton(button, {
      ring,
      scroll,
      onNavigate: vi.fn(),
    }).mount();
    expect(button.classList.contains("is-visible")).toBe(false);
    expect(ring.style.strokeDasharray).not.toBe("");

    scroll.set({ y: 500, progress: 0.5, viewportHeight: 800 });
    expect(button.classList.contains("is-visible")).toBe(true);
    button.click();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
