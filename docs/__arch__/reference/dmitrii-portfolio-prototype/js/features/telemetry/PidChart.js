import { PidModel } from "./PidModel.js";
import { tween } from "../../core/tween.js";
import { lerp } from "../../core/math.js";

/** Renders PidModel output and morphs between responses. */
export class PidChart {
  static X0 = 26;
  static WIDTH = 342;
  static MORPH_MS = 680;

  #el;
  #model = new PidModel();
  #outer;
  #inner;
  #cancel = null;
  #i18n;
  #isStep = true;

  /**
   * @param {{ outer: SVGPathElement, inner: SVGPathElement, area: SVGPathElement,
   *           marker: SVGCircleElement, meta: HTMLElement, mode: HTMLElement }} elements
   * @param {import("../../i18n/I18nService.js").I18nService} i18n
   */
  constructor(elements, i18n) {
    this.#el = elements;
    this.#i18n = i18n;
    const first = this.#model.generate();
    this.#outer = first.outer;
    this.#inner = first.inner;
    this.#render(this.#outer, this.#inner, first.markerIndex);
    this.#label(first);
  }

  next() {
    const next = this.#model.generate();
    this.#label(next);
    const fromOuter = this.#outer.slice();
    const fromInner = this.#inner.slice();
    this.#cancel?.();
    this.#cancel = tween({
      duration: PidChart.MORPH_MS,
      onUpdate: (t) => {
        this.#outer = fromOuter.map((v, i) => lerp(v, next.outer[i], t));
        this.#inner = fromInner.map((v, i) => lerp(v, next.inner[i], t));
        this.#render(this.#outer, this.#inner, next.markerIndex);
      },
    });
  }

  destroy() {
    this.#cancel?.();
  }

  /** Re-renders the mode badge in the current language. */
  relabel() {
    this.#el.mode.textContent = this.#i18n.t(this.#isStep ? "telemetry.mode.step" : "telemetry.mode.disturbance");
  }

  #x(i) {
    return PidChart.X0 + (i / PidModel.SAMPLES) * PidChart.WIDTH;
  }

  #path(values) {
    return values.map((y, i) => `${i === 0 ? "M" : "L"}${this.#x(i).toFixed(1)} ${y.toFixed(1)}`).join(" ");
  }

  #render(outer, inner, markerIndex) {
    const outerPath = this.#path(outer);
    this.#el.outer.setAttribute("d", outerPath);
    this.#el.inner.setAttribute("d", this.#path(inner));
    this.#el.area.setAttribute("d", `${outerPath} L368 164 L26 164 Z`);
    this.#el.marker.setAttribute("cx", this.#x(markerIndex).toFixed(1));
    this.#el.marker.setAttribute("cy", outer[markerIndex].toFixed(1));
  }

  #label({ meta, isStep }) {
    this.#el.meta.textContent = meta;
    this.#isStep = isStep;
    this.relabel();
  }
}
