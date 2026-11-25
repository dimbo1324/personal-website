import { reportError } from "../core/log";
import { whenPageIdle } from "../core/idle";
import { yieldToMain } from "../core/yield";
import { createServices } from "./createServices";
import type { AppContext, InitModule } from "./types";
import { initI18n } from "./modules/initI18n";
import { initHeader } from "./modules/initHeader";
import { initNavigation } from "./modules/initNavigation";
import { initHero } from "./modules/initHero";
import { initReel } from "./modules/initReel";
import { initUtilities } from "./modules/initUtilities";
import { initTelemetry } from "./modules/initTelemetry";
import { initScada } from "./modules/initScada";
import { initGallery } from "./modules/initGallery";
import { initDossier } from "./modules/initDossier";
import { initContact } from "./modules/initContact";
import { initRequest } from "./modules/initRequest";
import { initFooter } from "./modules/initFooter";
/** Composition root: creates shared services and wires every feature module. */
export class App {
  /** The first screen: header, navigation, hero, reel. */
  static readonly CRITICAL: readonly InitModule[] = Object.freeze([
    initI18n,
    initHeader,
    initNavigation,
    initHero,
    initReel,
    initUtilities,
  ]);

  /** Below the fold: started when the page is idle. */
  static readonly DEFERRED: readonly InitModule[] = Object.freeze([
    initTelemetry,
    initScada,
    initGallery,
    initDossier,
    initContact,
    initRequest,
    initFooter,
  ]);

  readonly #abort = new AbortController();
  readonly #components: Array<{ destroy(): void }> = [];
  readonly #disposers: (() => void)[] = [];
  readonly #context: AppContext;
  ready: Promise<void> = Promise.resolve();

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

  get context(): AppContext {
    return this.#context;
  }

  start(): this {
    const { theme, scroll, analytics } = this.#context;
    this.#disposers.push(theme.start(), scroll.start(), analytics.start());
    for (const init of App.CRITICAL) this.#run(init);
    this.ready = whenPageIdle({ timeout: 1200 }).then(async () => {
      for (const init of App.DEFERRED) {
        if (this.#abort.signal.aborted) return;
        await yieldToMain();
        this.#run(init);
      }
    });
    return this;
  }

  #run(init: InitModule): void {
    try {
      const result = init(this.#context);
      if (result && typeof result.then === "function")
        result.catch((error: unknown) => reportError(init.name, error));
    } catch (error) {
      reportError(init.name, error);
    }
  }

  destroy(): void {
    for (const component of this.#components.splice(0)) component.destroy();
    for (const dispose of this.#disposers.splice(0)) dispose?.();
    this.#abort.abort();
    this.#context.viewport.disconnect();
  }

  #use<TRoot extends Element, TComponent>(
    root: TRoot | null,
    factory: (root: TRoot) => TComponent,
  ): TComponent | null {
    if (!root) return null;
    try {
      const component = factory(root) as TComponent & {
        readonly mount?: () => void;
        readonly destroy?: () => void;
      };
      component.mount?.();
      if (typeof component.destroy === "function")
        this.#components.push({ destroy: component.destroy });
      return component;
    } catch (error) {
      reportError("App", error);
      return null;
    }
  }
}
