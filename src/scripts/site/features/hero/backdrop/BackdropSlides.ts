import { clamp01, easeOutCubic } from "../../../core/animation";
import { RenderTimeline as T } from "./RenderTimeline";

/** Drives the <img> slides through CSS custom properties. */
export class BackdropSlides {
  readonly slides: readonly HTMLImageElement[];

  constructor(slides: readonly HTMLImageElement[]) {
    this.slides = slides;
  }

  image(index: number): HTMLImageElement | undefined {
    return this.slides[index];
  }

  get length(): number {
    return this.slides.length;
  }

  update(fromIndex: number, toIndex: number, rawT: number): void {
    const from = this.slides[fromIndex];
    const to = this.slides[toIndex];

    if (from && fromIndex !== toIndex) {
      const out = easeOutCubic(clamp01(rawT / T.fadeOutEnd));
      this.#set(from, { mix: 1 - out, blur: out * 12, scale: 1 + out * 0.025 });
    }
    if (to) {
      const develop = easeOutCubic(
        clamp01((rawT - T.developStart) / (T.developEnd - T.developStart)),
      );
      this.#set(to, { mix: develop, blur: (1 - develop) * 10, scale: 1.02 - develop * 0.02 });
    }
  }

  settle(index: number): void {
    this.slides.forEach((slide, position) => {
      slide.style.removeProperty("--slide-mix");
      slide.style.removeProperty("--slide-blur");
      slide.style.removeProperty("--slide-scale");
      slide.classList.toggle("is-visible", position === index);
    });
  }

  #set(
    slide: HTMLImageElement,
    { mix, blur, scale }: { readonly mix: number; readonly blur: number; readonly scale: number },
  ): void {
    slide.style.setProperty("--slide-mix", mix.toFixed(3));
    slide.style.setProperty("--slide-blur", blur.toFixed(1));
    slide.style.setProperty("--slide-scale", scale.toFixed(4));
  }
}
