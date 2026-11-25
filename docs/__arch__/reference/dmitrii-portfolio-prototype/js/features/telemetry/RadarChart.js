import { createSvgElement } from "../../core/dom.js";
import { tween } from "../../core/tween.js";
import { lerp, rand, clamp } from "../../core/math.js";

/** Six-axis competency radar that morphs between scenarios. */
export class RadarChart {
  static CENTER = { x: 180, y: 140 };
  static RADIUS = 92;
  static MORPH_MS = 720;

  #svg;
  #axes;
  #scenarios;
  #values;
  #scenarioIndex = -1;
  #i18n;
  #name;

  /** Re-renders the scenario badge in the current language. */
  relabel() {
    this.#svg.scenarioTag.textContent = this.#i18n.pick(this.#name);
  }
  #nodes = [];
  #cancel = null;

  /**
   * @param {{ grid: SVGGElement, baseline: SVGPolygonElement, shape: SVGPolygonElement,
   *           nodes: SVGGElement, labels: SVGGElement, scenarioTag: HTMLElement, peak: HTMLElement }} svg
   * @param {{ axes: readonly string[], baseline: readonly number[],
   *           scenarios: readonly { name: string | Record<string, string>, weights: number[] }[],
   *           initialName: string | Record<string, string> }} data
   * @param {import("../../i18n/I18nService.js").I18nService} i18n
   */
  constructor(svg, { axes, baseline, scenarios, initialName }, i18n) {
    this.#svg = svg;
    this.#i18n = i18n;
    this.#name = initialName;
    this.#axes = axes;
    this.#scenarios = scenarios;
    this.#values = baseline.slice();
    this.#build(baseline);
    this.#draw(this.#values);
  }

  next() {
    this.#scenarioIndex = (this.#scenarioIndex + 1) % this.#scenarios.length;
    const scenario = this.#scenarios[this.#scenarioIndex];
    this.#name = scenario.name;
    this.relabel();

    const from = this.#values.slice();
    const to = scenario.weights.map((v) => clamp(v + rand(-5, 5), 58, 99));
    this.#cancel?.();
    this.#cancel = tween({
      duration: RadarChart.MORPH_MS,
      onUpdate: (t) => {
        this.#values = from.map((value, i) => lerp(value, to[i], t));
        this.#draw(this.#values);
      },
    });
  }

  destroy() {
    this.#cancel?.();
  }

  #polar(index, radius) {
    const angle = ((index * (360 / this.#axes.length) - 90) * Math.PI) / 180;
    return [RadarChart.CENTER.x + radius * Math.cos(angle), RadarChart.CENTER.y + radius * Math.sin(angle)];
  }

  #points(values) {
    return values
      .map((v, i) =>
        this.#polar(i, (v / 100) * RadarChart.RADIUS)
          .map((n) => n.toFixed(1))
          .join(","),
      )
      .join(" ");
  }

  #build(baseline) {
    const { grid, nodes, labels } = this.#svg;
    const { CENTER, RADIUS } = RadarChart;

    [0.33, 0.66, 1].forEach((scale, ringIndex) => {
      const ring = createSvgElement("polygon", {
        points: this.#axes.map((_, i) => this.#polar(i, RADIUS * scale).join(",")).join(" "),
        class: ringIndex === 2 ? "chart-radar__ring chart-radar__ring--outer" : "chart-radar__ring",
      });
      grid.append(ring);
    });

    this.#axes.forEach((label, i) => {
      const [ox, oy] = this.#polar(i, RADIUS);
      grid.append(createSvgElement("line", { x1: CENTER.x, y1: CENTER.y, x2: ox, y2: oy, class: "chart-radar__axis" }));

      const node = createSvgElement("circle", { r: 3.8, class: "chart-radar__node" });
      nodes.append(node);
      this.#nodes.push(node);

      const [lx, ly] = this.#polar(i, RADIUS + 20);
      const anchor = Math.abs(lx - CENTER.x) < 8 ? "middle" : lx > CENTER.x ? "start" : "end";
      const text = createSvgElement("text", {
        x: lx.toFixed(1),
        y: (ly + 3).toFixed(1),
        "text-anchor": anchor,
        class: "chart-radar__label",
      });
      text.textContent = label;
      labels.append(text);
    });

    this.#svg.baseline.setAttribute("points", this.#points(baseline));
  }

  #draw(values) {
    this.#svg.shape.setAttribute("points", this.#points(values));
    let peak = 0;
    values.forEach((value, i) => {
      if (value > values[peak]) peak = i;
      const [x, y] = this.#polar(i, (value / 100) * RadarChart.RADIUS);
      this.#nodes[i].setAttribute("cx", x.toFixed(1));
      this.#nodes[i].setAttribute("cy", y.toFixed(1));
    });
    this.#svg.peak.textContent = `${this.#axes[peak]} · ${Math.round(values[peak])}%`;
  }
}
