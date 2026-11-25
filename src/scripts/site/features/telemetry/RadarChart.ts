import { clamp, lerp, rand } from "../../core/animation";
import { createSvgElement } from "../../core/dom";
import { tween } from "../../core/tween";
import type { RadarScenario } from "../../data/radar";
import type { LocalizedText } from "../../i18n/types";
import type { I18nService } from "../../i18n/service";

interface RadarElements {
  readonly grid: SVGGElement;
  readonly baseline: SVGPolygonElement;
  readonly shape: SVGPolygonElement;
  readonly nodes: SVGGElement;
  readonly labels: SVGGElement;
  readonly scenarioTag: HTMLElement;
  readonly peak: HTMLElement;
}

interface RadarData {
  readonly axes: readonly string[];
  readonly baseline: readonly number[];
  readonly scenarios: readonly RadarScenario[];
  readonly initialName: LocalizedText;
}

/** Six-axis competency radar that morphs between scenarios. */
export class RadarChart {
  static readonly CENTER = { x: 180, y: 140 };
  static readonly RADIUS = 92;
  static readonly MORPH_MS = 720;

  readonly #svg: RadarElements;
  readonly #axes: readonly string[];
  readonly #scenarios: readonly RadarScenario[];
  readonly #i18n: I18nService;
  readonly #nodes: SVGElement[] = [];
  #values: number[];
  #name: LocalizedText;
  #scenarioIndex = -1;
  #cancel: (() => void) | null = null;

  constructor(
    svg: RadarElements,
    { axes, baseline, scenarios, initialName }: RadarData,
    i18n: I18nService,
  ) {
    this.#svg = svg;
    this.#i18n = i18n;
    this.#name = initialName;
    this.#axes = axes;
    this.#scenarios = scenarios;
    this.#values = baseline.slice();
    this.#build(baseline);
    this.#draw(this.#values);
  }

  /** Re-renders the scenario badge in the current language. */
  relabel(): void {
    this.#svg.scenarioTag.textContent = this.#i18n.pick(this.#name);
  }

  next(): void {
    this.#scenarioIndex = (this.#scenarioIndex + 1) % this.#scenarios.length;
    const scenario = this.#scenarios[this.#scenarioIndex];
    if (!scenario) return;
    this.#name = scenario.name;
    this.relabel();

    const from = this.#values.slice();
    const to = scenario.weights.map((value) => clamp(value + rand(-5, 5), 58, 99));
    this.#cancel?.();
    this.#cancel = tween({
      duration: RadarChart.MORPH_MS,
      onUpdate: (progress) => {
        this.#values = from.map((value, index) => lerp(value, to[index] ?? value, progress));
        this.#draw(this.#values);
      },
    });
  }

  destroy(): void {
    this.#cancel?.();
  }

  #polar(index: number, radius: number): number[] {
    const angle = ((index * (360 / this.#axes.length) - 90) * Math.PI) / 180;
    return [
      RadarChart.CENTER.x + radius * Math.cos(angle),
      RadarChart.CENTER.y + radius * Math.sin(angle),
    ];
  }

  #points(values: readonly number[]): string {
    return values
      .map((value, index) =>
        this.#polar(index, (value / 100) * RadarChart.RADIUS)
          .map((number) => number.toFixed(1))
          .join(","),
      )
      .join(" ");
  }

  #build(baseline: readonly number[]): void {
    const { grid, nodes, labels } = this.#svg;
    const { CENTER, RADIUS } = RadarChart;

    for (const [ringIndex, scale] of [0.33, 0.66, 1].entries()) {
      const ring = createSvgElement("polygon", {
        points: this.#axes
          .map((_, index) => this.#polar(index, RADIUS * scale).join(","))
          .join(" "),
        class: ringIndex === 2 ? "chart-radar__ring chart-radar__ring--outer" : "chart-radar__ring",
      });
      grid.append(ring);
    }

    this.#axes.forEach((label, index) => {
      const [outerX, outerY] = this.#polar(index, RADIUS);
      grid.append(
        createSvgElement("line", {
          x1: CENTER.x,
          y1: CENTER.y,
          x2: outerX ?? 0,
          y2: outerY ?? 0,
          class: "chart-radar__axis",
        }),
      );

      const node = createSvgElement("circle", { r: 3.8, class: "chart-radar__node" });
      nodes.append(node);
      this.#nodes.push(node);

      const [labelX, labelY] = this.#polar(index, RADIUS + 20);
      const anchor =
        Math.abs((labelX ?? 0) - CENTER.x) < 8
          ? "middle"
          : (labelX ?? 0) > CENTER.x
            ? "start"
            : "end";
      const text = createSvgElement("text", {
        x: (labelX ?? 0).toFixed(1),
        y: ((labelY ?? 0) + 3).toFixed(1),
        "text-anchor": anchor,
        class: "chart-radar__label",
      });
      text.textContent = label;
      labels.append(text);
    });

    this.#svg.baseline.setAttribute("points", this.#points(baseline));
  }

  #draw(values: readonly number[]): void {
    this.#svg.shape.setAttribute("points", this.#points(values));
    let peak = 0;
    values.forEach((value, index) => {
      if (value > (values[peak] ?? 0)) peak = index;
      const [x, y] = this.#polar(index, (value / 100) * RadarChart.RADIUS);
      this.#nodes[index]?.setAttribute("cx", (x ?? 0).toFixed(1));
      this.#nodes[index]?.setAttribute("cy", (y ?? 0).toFixed(1));
    });
    const peakValue = Math.round(values[peak] ?? 0);
    this.#svg.peak.textContent = `${this.#axes[peak] ?? ""} · ${peakValue}%`;
  }
}
