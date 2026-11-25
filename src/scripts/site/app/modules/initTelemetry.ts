import { hook } from "../../core/dom";
import { RadarChart } from "../../features/telemetry/RadarChart";
import { PidChart } from "../../features/telemetry/PidChart";
import { SpectrumChart } from "../../features/telemetry/SpectrumChart";
import { TelemetrySimulation } from "../../features/telemetry/TelemetrySimulation";
import { RADAR_AXES, RADAR_BASELINE, RADAR_INITIAL_NAME, RADAR_SCENARIOS } from "../../data/radar";
import type { AppContext } from "../types";

/** Live telemetry charts and their simulation controls. */
export function initTelemetry({ use, i18n, store, viewport }: AppContext): void {
  const root = document.getElementById("telemetry");
  if (!root) return;

  const radar = new RadarChart(
    {
      grid:
        hook<SVGGElement>("radar-grid") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGGElement),
      baseline:
        hook<SVGPolygonElement>("radar-baseline") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "polygon") as SVGPolygonElement),
      shape:
        hook<SVGPolygonElement>("radar-shape") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "polygon") as SVGPolygonElement),
      nodes:
        hook<SVGGElement>("radar-nodes") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGGElement),
      labels:
        hook<SVGGElement>("radar-labels") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGGElement),
      scenarioTag: hook("radar-scenario") ?? root,
      peak: hook("radar-peak") ?? root,
    },
    {
      axes: RADAR_AXES,
      baseline: RADAR_BASELINE,
      scenarios: RADAR_SCENARIOS,
      initialName: RADAR_INITIAL_NAME,
    },
    i18n,
  );

  const pid = new PidChart(
    {
      outer:
        hook<SVGPathElement>("pid-outer") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement),
      inner:
        hook<SVGPathElement>("pid-inner") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement),
      area:
        hook<SVGPathElement>("pid-area") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "path") as SVGPathElement),
      marker:
        hook<SVGCircleElement>("pid-marker") ??
        (document.createElementNS("http://www.w3.org/2000/svg", "circle") as SVGCircleElement),
      meta: hook("pid-meta") ?? root,
      mode: hook("pid-mode") ?? root,
    },
    i18n,
  );

  const spectrum = new SpectrumChart({
    group:
      hook<SVGGElement>("spectrum-bars") ??
      (document.createElementNS("http://www.w3.org/2000/svg", "g") as SVGGElement),
    peak: hook("spectrum-peak") ?? root,
    latency: hook("spectrum-latency") ?? root,
  });

  use(
    root,
    (element) =>
      new TelemetrySimulation(element, {
        charts: { radar, pid, spectrum },
        panels: {
          radar: hook("radar-panel") ?? element,
          pid: hook("pid-panel") ?? element,
          spectrum: hook("spectrum-panel") ?? element,
        },
        controls: {
          toggle: hook<HTMLButtonElement>("sim-toggle") ?? document.createElement("button"),
          toggleText: hook("sim-toggle-text") ?? element,
          resample: hook<HTMLButtonElement>("sim-resample") ?? document.createElement("button"),
          counter: hook("sim-cycle") ?? element,
        },
        i18n,
        store,
        viewport,
      }),
  );
}
