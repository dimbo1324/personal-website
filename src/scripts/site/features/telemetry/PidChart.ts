import { lerp } from "../../core/animation";
import { tween } from "../../core/tween";
import type { I18nService } from "../../i18n/service";
import { PidModel } from "./PidModel";

interface PidElements {
  readonly outer: SVGPathElement;
  readonly inner: SVGPathElement;
  readonly area: SVGPathElement;
  readonly marker: SVGCircleElement;
  readonly meta: HTMLElement;
  readonly mode: HTMLElement;
}

/** Renders PidModel output and morphs between responses. */
export class PidChart {
  static readonly X0 = 26;
  static readonly WIDTH = 342;
  static readonly MORPH_MS = 680;

  readonly #el: PidElements;
  readonly #model = new PidModel();
  readonly #i18n: I18nService;
  #outer: number[];
  #inner: number[];
  #cancel: (() => void) | null = null;
  #isStep = true;

  constructor(elements: PidElements, i18n: I18nService) {
    this.#el = elements;
    this.#i18n = i18n;
    const first = this.#model.generate();
    this.#outer = first.outer;
    this.#inner = first.inner;
    this.#render(this.#outer, this.#inner, first.markerIndex);
    this.#label(first);
  }

  next(): void {
    const next = this.#model.generate();
    this.#label(next);
    const fromOuter = this.#outer.slice();
    const fromInner = this.#inner.slice();
    this.#cancel?.();
    this.#cancel = tween({
      duration: PidChart.MORPH_MS,
      onUpdate: (progress) => {
        this.#outer = fromOuter.map((value, index) =>
          lerp(value, next.outer[index] ?? value, progress),
        );
        this.#inner = fromInner.map((value, index) =>
          lerp(value, next.inner[index] ?? value, progress),
        );
        this.#render(this.#outer, this.#inner, next.markerIndex);
      },
    });
  }

  destroy(): void {
    this.#cancel?.();
  }

  /** Re-renders the mode badge in the current language. */
  relabel(): void {
    this.#el.mode.textContent = this.#i18n.t(
      this.#isStep ? "telemetry.mode.step" : "telemetry.mode.disturbance",
    );
  }

  #x(index: number): number {
    return PidChart.X0 + (index / PidModel.SAMPLES) * PidChart.WIDTH;
  }

  #path(values: readonly number[]): string {
    return values
      .map((y, index) => `${index === 0 ? "M" : "L"}${this.#x(index).toFixed(1)} ${y.toFixed(1)}`)
      .join(" ");
  }

  #render(outer: readonly number[], inner: readonly number[], markerIndex: number): void {
    const outerPath = this.#path(outer);
    this.#el.outer.setAttribute("d", outerPath);
    this.#el.inner.setAttribute("d", this.#path(inner));
    this.#el.area.setAttribute("d", `${outerPath} L368 164 L26 164 Z`);
    this.#el.marker.setAttribute("cx", this.#x(markerIndex).toFixed(1));
    this.#el.marker.setAttribute("cy", (outer[markerIndex] ?? 0).toFixed(1));
  }

  #label(response: { readonly meta: string; readonly isStep: boolean }): void {
    this.#el.meta.textContent = response.meta;
    this.#isStep = response.isStep;
    this.relabel();
  }
}
