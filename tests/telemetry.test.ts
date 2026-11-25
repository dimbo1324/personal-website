// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { PidModel } from "../src/scripts/site/features/telemetry/PidModel";
import { PidChart } from "../src/scripts/site/features/telemetry/PidChart";
import { RadarChart } from "../src/scripts/site/features/telemetry/RadarChart";
import { SpectrumChart } from "../src/scripts/site/features/telemetry/SpectrumChart";
import {
  RADAR_AXES,
  RADAR_BASELINE,
  RADAR_INITIAL_NAME,
  RADAR_SCENARIOS,
} from "../src/scripts/site/data/radar";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { stubAnimationFrame } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
const svg = <T extends SVGElement>(tag: string): T =>
  document.createElementNS("http://www.w3.org/2000/svg", tag) as T;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("PidModel", () => {
  it("generates a bounded response with a marker and metadata", () => {
    const result = new PidModel().generate();
    expect(result.outer).toHaveLength(PidModel.SAMPLES + 1);
    expect(result.inner).toHaveLength(PidModel.SAMPLES + 1);
    expect(result.markerIndex).toBeGreaterThanOrEqual(0);
    expect(result.markerIndex).toBeLessThan(PidModel.SAMPLES);
    expect(result.meta).toMatch(/Ts \d+s · OS [\d.]+%|Disturb @\d+s · −\d+%/);
    expect(typeof result.isStep).toBe("boolean");
  });
});

describe("PidChart", () => {
  it("renders paths and morphs to the next response", () => {
    const frame = stubAnimationFrame();
    vi.spyOn(performance, "now").mockReturnValue(0);
    const elements = {
      outer: svg<SVGPathElement>("path"),
      inner: svg<SVGPathElement>("path"),
      area: svg<SVGPathElement>("path"),
      marker: svg<SVGCircleElement>("circle"),
      meta: document.createElement("span"),
      mode: document.createElement("span"),
    };
    const chart = new PidChart(elements, i18n);
    const firstPath = elements.outer.getAttribute("d");
    expect(firstPath).toContain("M26.0");
    expect(elements.area.getAttribute("d")).toContain("L368 164 L26 164 Z");
    expect(elements.mode.textContent).toBeTruthy();

    chart.next();
    frame.tick(340);
    expect(elements.outer.getAttribute("d")).not.toBe(firstPath);
    chart.destroy();
  });
});

describe("RadarChart", () => {
  it("builds the grid, labels and scenario shape", () => {
    const frame = stubAnimationFrame();
    vi.spyOn(performance, "now").mockReturnValue(0);
    const elements = {
      grid: svg<SVGGElement>("g"),
      baseline: svg<SVGPolygonElement>("polygon"),
      shape: svg<SVGPolygonElement>("polygon"),
      nodes: svg<SVGGElement>("g"),
      labels: svg<SVGGElement>("g"),
      scenarioTag: document.createElement("span"),
      peak: document.createElement("span"),
    };
    const chart = new RadarChart(
      elements,
      {
        axes: RADAR_AXES,
        baseline: RADAR_BASELINE,
        scenarios: RADAR_SCENARIOS,
        initialName: RADAR_INITIAL_NAME,
      },
      i18n,
    );

    expect(elements.grid.querySelectorAll("polygon")).toHaveLength(3);
    expect(elements.grid.querySelectorAll("line")).toHaveLength(6);
    expect(elements.labels.querySelectorAll("text")).toHaveLength(6);
    expect(elements.nodes.querySelectorAll("circle")).toHaveLength(6);
    expect(elements.baseline.getAttribute("points")).toContain(",");
    expect(elements.peak.textContent).toContain("%");

    chart.next();
    frame.tick(360);
    expect(elements.scenarioTag.textContent).toBe(i18n.pick(RADAR_SCENARIOS[0]?.name ?? ""));
    chart.destroy();
  });
});

describe("SpectrumChart", () => {
  it("creates bars and updates throughput and latency", () => {
    const elements = {
      group: svg<SVGGElement>("g"),
      peak: document.createElement("span"),
      latency: document.createElement("span"),
    };
    const chart = new SpectrumChart(elements);
    expect(elements.group.querySelectorAll("rect")).toHaveLength(SpectrumChart.BARS);
    expect(elements.peak.textContent).toContain("msg/s");
    expect(elements.latency.textContent).toContain("ms");

    chart.update({ burst: true });
    const high = elements.group.querySelectorAll(".is-high, .is-mid").length;
    expect(high).toBeGreaterThan(0);
    chart.destroy();
  });
});
