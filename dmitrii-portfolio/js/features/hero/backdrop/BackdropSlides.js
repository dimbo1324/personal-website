import { clamp01 } from "../../../core/math.js";
import { easeOutCubic } from "../../../core/easing.js";
import { RenderTimeline as T } from "./RenderTimeline.js";

/**
 * Drives the <img> slides behind the render through CSS custom properties
 * (--slide-mix / --slide-blur / --slide-scale). The theme-specific photo
 * opacity stays in CSS, so switching theme mid-render just works.
 */
export class BackdropSlides {
  /** @param {HTMLImageElement[]} slides */
  constructor(slides) {
    this.slides = slides;
  }

  image(index) {
    return this.slides[index];
  }

  get length() {
    return this.slides.length;
  }

  /** Per-frame update during a render. */
  update(fromIndex, toIndex, rawT) {
    const from = this.slides[fromIndex];
    const to = this.slides[toIndex];

    if (from && fromIndex !== toIndex) {
      const out = easeOutCubic(clamp01(rawT / T.fadeOutEnd));
      this.#set(from, { mix: 1 - out, blur: out * 12, scale: 1 + out * 0.025 });
    }
    if (to) {
      const develop = easeOutCubic(clamp01((rawT - T.developStart) / (T.developEnd - T.developStart)));
      this.#set(to, { mix: develop, blur: (1 - develop) * 10, scale: 1.02 - develop * 0.02 });
    }
  }

  /** Snap to a final state: only `index` visible, inline overrides removed. */
  settle(index) {
    this.slides.forEach((slide, i) => {
      slide.style.removeProperty("--slide-mix");
      slide.style.removeProperty("--slide-blur");
      slide.style.removeProperty("--slide-scale");
      slide.classList.toggle("is-visible", i === index);
    });
  }

  #set(slide, { mix, blur, scale }) {
    slide.style.setProperty("--slide-mix", mix.toFixed(3));
    slide.style.setProperty("--slide-blur", blur.toFixed(1));
    slide.style.setProperty("--slide-scale", scale.toFixed(4));
  }
}
