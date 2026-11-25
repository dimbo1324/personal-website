import { Component } from "../../core/Component.js";
import { motion } from "../../core/MotionPreference.js";
import { clamp01 } from "../../core/math.js";
import { RasterRenderer } from "./backdrop/RasterRenderer.js";
import { BackdropSlides } from "./backdrop/BackdropSlides.js";
import { RenderTimeline as T } from "./backdrop/RenderTimeline.js";
import { whenPageIdle } from "../../core/whenPageIdle.js";

/**
 * Controller for the hero backdrop: scene buttons, status line,
 * optional auto-cycling and visibility. Rendering itself is delegated to
 * RasterRenderer. With the default effects budget the raster only runs
 * when a visitor picks a scene (see data/effects.js).
 */
export class HeroBackdrop extends Component {
  #renderer;
  #slides;
  #buttons;
  #status;
  #statusText;
  #sceneNames;
  #i18n;
  #cycle;
  /** @type {{ key: string, vars?: Record<string, any>, busy: boolean }} */
  #message = { key: "scene.rendered", vars: { index: 0 }, busy: false };
  #timer = 0;
  #visible = true;
  #pageIdle = false;

  /**
   * @param {HTMLElement} root  the hero section
   * @param {{ canvas: HTMLCanvasElement, slides: HTMLImageElement[], buttons: HTMLButtonElement[],
   *           status: HTMLElement, statusText: HTMLElement, sceneNames: readonly (string | Record<string, string>)[],
   *           cycle: { autoCycle: boolean, cycleMs: number, ambientFps: number },
   *           i18n: import("../../i18n/I18nService.js").I18nService,
   *           store: import("../../core/Store.js").Store,
   *           viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options
   */
  constructor(root, { canvas, slides, buttons, status, statusText, sceneNames, cycle, i18n, store, viewport }) {
    super(root);
    this.#cycle = cycle;
    this.#i18n = i18n;
    this.#slides = new BackdropSlides(slides);
    this.#buttons = buttons;
    this.#status = status;
    this.#statusText = statusText;
    this.#sceneNames = sceneNames;
    this.store = store;
    this.viewport = viewport;
    this.#renderer = new RasterRenderer(canvas, {
      isDark: () => store.get("theme") === "dark",
      ambient: !motion.reduced,
      ambientFps: cycle.ambientFps,
    });
  }

  mount() {
    this.#resize();
    this.on(window, "resize", () => this.#resize(), { passive: true });

    this.#buttons.forEach((button) => {
      this.on(button, "click", () => this.show(Number(button.dataset.scene) || 0));
    });

    this.own(this.store.subscribe("heroScene", (index) => this.#syncButtons(index)));
    this.own(
      this.viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#syncActive();
      }),
    );

    this.own(this.#i18n.subscribe(() => this.#renderStatus()));
    // the ambient field starts after the page has loaded — it must not delay the first paint
    whenPageIdle().then(() => {
      this.#pageIdle = true;
      if (!this.signal.aborted) this.#syncActive();
    });
    if (this.#cycle.autoCycle) this.#schedule(this.#cycle.cycleMs);
    return super.mount();
  }

  onDestroy() {
    clearTimeout(this.#timer);
    this.#renderer.destroy();
  }

  #syncActive() {
    this.#renderer.setActive(this.#visible && this.#pageIdle && !motion.reduced);
  }

  /** Render scene `index` (no-op if already shown and idle). */
  show(index) {
    const from = this.store.get("heroScene");
    if (index === from && !this.#renderer.isBusy) return;

    this.store.set("heroScene", index);

    if (motion.reduced) {
      this.#slides.settle(index);
      this.#setStatus("scene.rendered", { index }, false);
      return;
    }

    this.#pageIdle = true; // a click before the page settled starts drawing right away
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

  #onFrame(from, to, rawT, headK) {
    this.#slides.update(from, to, rawT);
    if (rawT < T.sampleEnd) {
      this.#setStatus("scene.sampling", undefined, true);
    } else if (headK < 1) {
      const passes = this.#renderer.passes;
      const pass = Math.min(passes - 1, Math.floor(clamp01(headK) * passes)) + 1;
      this.#setStatus("scene.rendering", { pass, passes, percent: Math.round(clamp01(headK) * 100) }, true);
    } else {
      const develop = clamp01((rawT - T.headEnd) / (T.statusDevelopEnd - T.headEnd));
      this.#setStatus("scene.developing", { percent: Math.round(develop * 100) }, true);
    }
  }

  #onComplete(index) {
    this.#slides.settle(index);
    this.#setStatus("scene.rendered", { index }, false);
  }

  #schedule(delay) {
    clearTimeout(this.#timer);
    if (motion.reduced || this.#slides.length < 2) return;
    this.#timer = window.setTimeout(() => {
      if (this.#visible && !document.hidden) {
        this.show((this.store.get("heroScene") + 1) % this.#slides.length);
      } else {
        this.#schedule(this.#cycle.cycleMs);
      }
    }, delay);
  }

  #resize() {
    const rect = this.root.getBoundingClientRect();
    this.#renderer.resize(rect.width, rect.height);
  }

  #syncButtons(index) {
    this.#buttons.forEach((button, i) => {
      const active = i === index;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  /** @param {string} key  @param {Record<string, any> | undefined} vars  @param {boolean} busy */
  #setStatus(key, vars, busy) {
    this.#message = { key, vars, busy };
    this.#renderStatus();
  }

  #renderStatus() {
    const { key, vars, busy } = this.#message;
    const resolved = vars && "index" in vars ? { ...vars, name: this.#i18n.pick(this.#sceneNames[vars.index]) } : vars;
    const text = this.#i18n.t(key, resolved);
    if (this.#statusText.textContent !== text) this.#statusText.textContent = text;
    this.#status.classList.toggle("is-busy", busy);
  }
}
