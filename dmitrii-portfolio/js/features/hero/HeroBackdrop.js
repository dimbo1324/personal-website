import { Component } from "../../core/Component.js";
import { motion } from "../../core/MotionPreference.js";
import { clamp01 } from "../../core/math.js";
import { RasterRenderer } from "./backdrop/RasterRenderer.js";
import { BackdropSlides } from "./backdrop/BackdropSlides.js";
import { RenderTimeline as T } from "./backdrop/RenderTimeline.js";

/**
 * Controller for the hero backdrop: scene buttons, status line,
 * auto-cycling and visibility. Rendering itself is delegated to RasterRenderer.
 */
export class HeroBackdrop extends Component {
  static AUTO_CYCLE_MS = 6800;
  static FIRST_RENDER_MS = 2600;

  #renderer;
  #slides;
  #buttons;
  #status;
  #statusText;
  #sceneNames;
  #timer = 0;
  #visible = true;

  /**
   * @param {HTMLElement} root  the hero section
   * @param {{ canvas: HTMLCanvasElement, slides: HTMLImageElement[], buttons: HTMLButtonElement[],
   *           status: HTMLElement, statusText: HTMLElement, sceneNames: readonly string[],
   *           store: import("../../core/Store.js").Store,
   *           viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options
   */
  constructor(root, { canvas, slides, buttons, status, statusText, sceneNames, store, viewport }) {
    super(root);
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
        this.#renderer.setActive(this.#visible && !motion.reduced);
      }),
    );

    if (!motion.reduced) this.#schedule(HeroBackdrop.FIRST_RENDER_MS);
    return super.mount();
  }

  onDestroy() {
    clearTimeout(this.#timer);
    this.#renderer.destroy();
  }

  /** Render scene `index` (no-op if already shown and idle). */
  show(index) {
    const from = this.store.get("heroScene");
    if (index === from && !this.#renderer.isBusy) return;

    this.store.set("heroScene", index);

    if (motion.reduced) {
      this.#slides.settle(index);
      this.#setStatus(`Rendered · ${this.#sceneNames[index]}`, false);
      return;
    }

    this.#slides.settle(from);
    this.#status.classList.add("is-busy");
    this.#renderer.render({
      image: this.#slides.image(index),
      index,
      from,
      onFrame: (rawT, headK) => this.#onFrame(from, index, rawT, headK),
      onComplete: () => this.#onComplete(index),
    });
    this.#schedule(HeroBackdrop.AUTO_CYCLE_MS);
  }

  #onFrame(from, to, rawT, headK) {
    this.#slides.update(from, to, rawT);
    if (rawT < T.sampleEnd) {
      this.#setStatus("Sampling latent…", true);
    } else if (headK < 1) {
      const passes = this.#renderer.passes;
      const pass = Math.min(passes - 1, Math.floor(clamp01(headK) * passes)) + 1;
      this.#setStatus(`Rendering · pass ${pass}/${passes} · ${Math.round(clamp01(headK) * 100)}%`, true);
    } else {
      const develop = clamp01((rawT - T.headEnd) / (T.statusDevelopEnd - T.headEnd));
      this.#setStatus(`Developing · ${Math.round(develop * 100)}%`, true);
    }
  }

  #onComplete(index) {
    this.#slides.settle(index);
    this.#setStatus(`Rendered · ${this.#sceneNames[index]}`, false);
  }

  #schedule(delay) {
    clearTimeout(this.#timer);
    if (motion.reduced || this.#slides.length < 2) return;
    this.#timer = window.setTimeout(() => {
      if (this.#visible && !document.hidden) {
        this.show((this.store.get("heroScene") + 1) % this.#slides.length);
      } else {
        this.#schedule(HeroBackdrop.AUTO_CYCLE_MS);
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

  #setStatus(text, busy) {
    if (this.#statusText.textContent !== text) this.#statusText.textContent = text;
    this.#status.classList.toggle("is-busy", busy);
  }
}
