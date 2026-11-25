// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroBackdrop } from "../src/scripts/site/features/hero/HeroBackdrop";
import { Store } from "../src/scripts/site/core/store";
import type { AppState } from "../src/scripts/site/app/state";
import type { ViewportObserver } from "../src/scripts/site/core/viewport";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { SCENE_NAMES } from "../src/scripts/site/data/scenes";
import { setBody, stubAnimationFrame, stubCanvasContext } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
const viewport = {
  watch: vi.fn(() => () => undefined),
  unwatch: vi.fn(),
  disconnect: vi.fn(),
} as unknown as ViewportObserver;

function store(): Store<AppState> {
  return new Store<AppState>({
    theme: "dark",
    activeSection: "overview",
    heroScene: 0,
    simRunning: true,
    cycle: 1,
    widgetState: "closed",
    widgetMaximized: false,
  });
}

function fixture(state: Store<AppState>): HeroBackdrop {
  setBody(`
    <section data-js="hero">
      <canvas data-js="canvas"></canvas>
      <img data-js="slide" class="is-visible" /><img data-js="slide" /><img data-js="slide" />
      <span data-js="status"></span><span data-js="status-text"></span>
      <button data-scene="0"></button><button data-scene="1"></button><button data-scene="2"></button>
    </section>
  `);
  const get = (name: string): HTMLElement => {
    const element = document.querySelector<HTMLElement>(`[data-js="${name}"]`);
    if (!element) throw new Error(`missing ${name}`);
    return element;
  };
  return new HeroBackdrop(get("hero"), {
    canvas: get("canvas") as HTMLCanvasElement,
    slides: Array.from(document.querySelectorAll<HTMLImageElement>("[data-js=slide]")),
    buttons: Array.from(document.querySelectorAll<HTMLButtonElement>("[data-scene]")),
    status: get("status"),
    statusText: get("status-text"),
    sceneNames: SCENE_NAMES,
    cycle: { autoCycle: false, cycleMs: 6800, ambientFps: 30 },
    i18n,
    store: state,
    viewport,
  }).mount();
}

beforeEach(() => {
  Object.defineProperty(document, "readyState", { configurable: true, value: "complete" });
  stubAnimationFrame();
  stubCanvasContext();
  i18n.set("en");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("HeroBackdrop", () => {
  it("switches scenes and marks the active button", () => {
    const state = store();
    fixture(state);
    const buttons = document.querySelectorAll<HTMLButtonElement>("[data-scene]");
    buttons[1]?.click();
    expect(state.get("heroScene")).toBe(1);
    expect(buttons[1]?.getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0]?.getAttribute("aria-pressed")).toBe("false");
  });

  it("renders a status message for a scene", () => {
    const state = store();
    const backdrop = fixture(state);
    backdrop.show(2);
    const status = document.querySelector<HTMLElement>("[data-js=status-text]");
    expect(status?.textContent).toBeTruthy();
    expect(document.querySelector("[data-js=status]")?.classList.contains("is-busy")).toBe(true);
    backdrop.destroy();
  });
});
