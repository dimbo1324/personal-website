import { createServices } from "./createServices.js";
import { initI18n } from "./modules/initI18n.js";
import { initHeader } from "./modules/initHeader.js";
import { initNavigation } from "./modules/initNavigation.js";
import { initHero } from "./modules/initHero.js";
import { initReel } from "./modules/initReel.js";
import { initTelemetry } from "./modules/initTelemetry.js";
import { initScada } from "./modules/initScada.js";
import { initGallery } from "./modules/initGallery.js";
import { initDossier } from "./modules/initDossier.js";
import { initContact } from "./modules/initContact.js";
import { initRequest } from "./modules/initRequest.js";
import { initFooter } from "./modules/initFooter.js";
import { initUtilities } from "./modules/initUtilities.js";
import { whenPageIdle } from "../core/whenPageIdle.js";
import { yieldToMain } from "../core/yieldToMain.js";

/**
 * Composition root. Creates the shared services once and lets each feature
 * module wire its components with exactly the elements and services it needs.
 * Keeps every component and disposer so the whole page can be torn down.
 * A missing element or a failing feature disables only that feature.
 *
 * Start-up is split in two phases: what the first screen needs runs at once;
 * everything below the fold starts once the page is idle, one module per
 * task, so no long task blocks the first interaction.
 *
 * @typedef {import("./createServices.js").Services & {
 *   use: <T extends import("../core/Component.js").Component>(root: Element | null, factory: (root: any) => T) => T | null,
 *   dispose: (disposer: (() => void) | undefined) => void,
 *   signal: AbortSignal,
 * }} AppContext
 */
export class App {
  /** The first screen: header, navigation, hero, reel. */
  static CRITICAL = Object.freeze([initI18n, initHeader, initNavigation, initHero, initReel, initUtilities]);

  /** Below the fold: started when the page is idle. */
  static DEFERRED = Object.freeze([initTelemetry, initScada, initGallery, initDossier, initContact, initRequest, initFooter]);

  #abort = new AbortController();
  #components = [];
  #disposers = [];
  /** @type {AppContext} */
  #context;

  constructor() {
    const services = createServices();
    this.#context = {
      ...services,
      use: (root, factory) => this.#use(root, factory),
      dispose: (disposer) => {
        if (typeof disposer === "function") this.#disposers.push(disposer);
      },
      signal: this.#abort.signal,
    };
  }

  get context() {
    return this.#context;
  }

  start() {
    const { theme, scroll, analytics } = this.#context;
    this.#disposers.push(theme.start(), scroll.start(), analytics.start());
    App.CRITICAL.forEach((init) => this.#run(init));
    this.ready = whenPageIdle({ timeout: 1200 }).then(async () => {
      for (const init of App.DEFERRED) {
        if (this.#abort.signal.aborted) return;
        await yieldToMain();
        this.#run(init);
      }
    });
    return this;
  }

  /** Resolves once every module has started (useful in tests and the console). */
  ready = Promise.resolve();

  #run(init) {
    try {
      init(this.#context);
    } catch (error) {
      console.error(`[App] ${init.name} failed:`, error);
    }
  }

  destroy() {
    this.#components.splice(0).forEach((component) => component.destroy());
    this.#disposers.splice(0).forEach((dispose) => dispose?.());
    this.#abort.abort();
    this.#context.viewport.disconnect();
  }

  /** Instantiate + mount a component only if its root exists. */
  #use(root, factory) {
    if (!root) return null;
    try {
      const component = factory(root).mount();
      this.#components.push(component);
      return component;
    } catch (error) {
      console.error("[App] feature failed to start:", error);
      return null;
    }
  }
}
