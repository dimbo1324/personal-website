import { Component } from "../../core/component";
import { clamp01 } from "../../core/animation";
import { whenPageIdle } from "../../core/idle";
import { motion } from "../../core/motion";
import type { Store } from "../../core/store";
import type { AppState } from "../../app/state";
import type { ViewportObserver } from "../../core/viewport";
import type { I18nService } from "../../i18n/service";
import type { LocalizedText, MessageVars } from "../../i18n/types";
import { BackdropSlides } from "./backdrop/BackdropSlides";
import { RasterRenderer } from "./backdrop/RasterRenderer";
import { RenderTimeline as T } from "./backdrop/RenderTimeline";

interface HeroBackdropOptions {
  readonly canvas: HTMLCanvasElement;
  readonly slides: readonly HTMLImageElement[];
  readonly buttons: readonly HTMLButtonElement[];
  readonly status: HTMLElement;
  readonly statusText: HTMLElement;
  readonly sceneNames: readonly LocalizedText[];
  readonly cycle: {
    readonly autoCycle: boolean;
    readonly cycleMs: number;
    readonly ambientFps: number;
  };
  readonly i18n: I18nService;
  readonly store: Store<AppState>;
  readonly viewport: ViewportObserver;
}

interface StatusMessage {
  readonly key: string;
  readonly vars: MessageVars | undefined;
  readonly busy: boolean;
}

/** Controller for the hero backdrop: scene buttons, status line and rendering. */
export class HeroBackdrop extends Component<HTMLElement> {
  readonly #slides: BackdropSlides;
  readonly #buttons: readonly HTMLButtonElement[];
  readonly #status: HTMLElement;
  readonly #statusText: HTMLElement;
  readonly #sceneNames: readonly LocalizedText[];
  readonly #i18n: I18nService;
  readonly #store: Store<AppState>;
  readonly #viewport: ViewportObserver;
  readonly #renderer: RasterRenderer;
  readonly #cycle: HeroBackdropOptions["cycle"];
  #message: StatusMessage = { key: "scene.rendered", vars: { index: 0 }, busy: false };
  #timer = 0;
  #visible = true;
  #pageIdle = false;

  constructor(
    root: HTMLElement,
    {
      canvas,
      slides,
      buttons,
      status,
      statusText,
      sceneNames,
      cycle,
      i18n,
      store,
      viewport,
    }: HeroBackdropOptions,
  ) {
    super(root);
    this.#cycle = cycle;
    this.#i18n = i18n;
    this.#slides = new BackdropSlides(slides);
    this.#buttons = buttons;
    this.#status = status;
    this.#statusText = statusText;
    this.#sceneNames = sceneNames;
    this.#store = store;
    this.#viewport = viewport;
    this.#renderer = new RasterRenderer(canvas, {
      isDark: () => store.get("theme") === "dark",
      ambient: !motion.reduced,
      ambientFps: cycle.ambientFps,
    });
  }

  override mount(): this {
    this.#resize();
    this.on(window, "resize", () => this.#resize(), { passive: true });

    for (const button of this.#buttons) {
      this.on(button, "click", () => this.show(Number(button.dataset.scene) || 0));
    }

    this.own(this.#store.subscribe("heroScene", (index) => this.#syncButtons(index)));
    this.own(
      this.#viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#syncActive();
      }),
    );
    this.own(this.#i18n.subscribe(() => this.#renderStatus()));
    // The ambient field starts after the page has loaded — it must not delay the first paint.
    void whenPageIdle().then(() => {
      this.#pageIdle = true;
      if (!this.signal.aborted) this.#syncActive();
    });
    if (this.#cycle.autoCycle) this.#schedule(this.#cycle.cycleMs);
    return super.mount();
  }

  protected override onDestroy(): void {
    window.clearTimeout(this.#timer);
    this.#renderer.destroy();
  }

  #syncActive(): void {
    this.#renderer.setActive(this.#visible && this.#pageIdle && !motion.reduced);
  }

  /** Render scene `index` (no-op if already shown and idle). */
  show(index: number): void {
    const from = this.#store.get("heroScene");
    if (index === from && !this.#renderer.isBusy) return;

    this.#store.set("heroScene", index);

    if (motion.reduced) {
      this.#slides.settle(index);
      this.#setStatus("scene.rendered", { index }, false);
      return;
    }

    this.#pageIdle = true;
    this.#syncActive();
    this.#slides.settle(from);
    this.#status.classList.add("is-busy");
    this.#renderer.render({
      image: this.#slides.image(index),
      index,
      from,
      onFrame: (rawT, headK) => this.#onFrame(from, index, rawT, headK),
      onComplete: () => this.#onComplete(index),
    });
    if (this.#cycle.autoCycle) this.#schedule(this.#cycle.cycleMs);
  }

  #onFrame(from: number, to: number, rawT: number, headK: number): void {
    this.#slides.update(from, to, rawT);
    if (rawT < T.sampleEnd) {
      this.#setStatus("scene.sampling", undefined, true);
    } else if (headK < 1) {
      const passes = this.#renderer.passes;
      const pass = Math.min(passes - 1, Math.floor(clamp01(headK) * passes)) + 1;
      this.#setStatus(
        "scene.rendering",
        { pass, passes, percent: Math.round(clamp01(headK) * 100) },
        true,
      );
    } else {
      const develop = clamp01((rawT - T.headEnd) / (T.statusDevelopEnd - T.headEnd));
      this.#setStatus("scene.developing", { percent: Math.round(develop * 100) }, true);
    }
  }

  #onComplete(index: number): void {
    this.#slides.settle(index);
    this.#setStatus("scene.rendered", { index }, false);
  }

  #schedule(delay: number): void {
    window.clearTimeout(this.#timer);
    if (motion.reduced || this.#slides.length < 2) return;
    this.#timer = window.setTimeout(() => {
      if (this.#visible && !document.hidden) {
        this.show((this.#store.get("heroScene") + 1) % this.#slides.length);
      } else {
        this.#schedule(this.#cycle.cycleMs);
      }
    }, delay);
  }

  #resize(): void {
    const rect = this.root.getBoundingClientRect();
    this.#renderer.resize(rect.width, rect.height);
  }

  #syncButtons(index: number): void {
    this.#buttons.forEach((button, position) => {
      const active = position === index;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  #setStatus(key: string, vars: MessageVars | undefined, busy: boolean): void {
    this.#message = { key, vars, busy };
    this.#renderStatus();
  }

  #renderStatus(): void {
    const { key, vars, busy } = this.#message;
    let resolved = vars;
    if (vars && "index" in vars) {
      const scene = this.#sceneNames[Number(vars.index)];
      resolved = { ...vars, name: scene ? this.#i18n.pick(scene) : "" };
    }
    const text = this.#i18n.t(key, resolved);
    if (this.#statusText.textContent !== text) this.#statusText.textContent = text;
    this.#status.classList.toggle("is-busy", busy);
  }
}
