import { createSvgElement } from "../../core/dom.js";
import { rand } from "../../core/math.js";

/** Broker throughput histogram; bars animate via CSS transitions. */
export class SpectrumChart {
  static BARS = 20;
  static WIDTH = 360;
  static BASELINE = 164;

  #bars = [];
  #el;

  /** @param {{ group: SVGGElement, peak: HTMLElement, latency: HTMLElement }} elements */
  constructor(elements) {
    this.#el = elements;
    const barWidth = SpectrumChart.WIDTH / SpectrumChart.BARS;
    for (let i = 0; i < SpectrumChart.BARS; i += 1) {
      const bar = createSvgElement("rect", {
        x: (i * barWidth + 2.5).toFixed(1),
        width: (barWidth - 5).toFixed(1),
        y: 100,
        height: 64,
        class: "chart-spectrum__bar",
      });
      elements.group.append(bar);
      this.#bars.push(bar);
    }
    this.update();
  }

  /** @param {{ burst?: boolean }} [options] */
  update({ burst = false } = {}) {
    let peak = 0;
    this.#bars.forEach((bar, i) => {
      const envelope = Math.sin((i / SpectrumChart.BARS) * Math.PI) * 34;
      const boost = burst ? rand(30, 60) : 0;
      const height = Math.round(Math.max(18, Math.min(138, 32 + envelope + rand(-18, 62) + boost)));
      bar.setAttribute("y", String(SpectrumChart.BASELINE - height));
      bar.setAttribute("height", String(height));
      bar.classList.toggle("is-high", height > 104);
      bar.classList.toggle("is-mid", height > 64 && height <= 104);
      peak = Math.max(peak, height);
    });
    this.#el.peak.textContent = `${Math.round(920 + peak * 5.6).toLocaleString("en-US")} msg/s`;
    this.#el.latency.textContent = `${rand(burst ? 14 : 8.4, burst ? 22 : 15.8).toFixed(1)} ms`;
  }
}
