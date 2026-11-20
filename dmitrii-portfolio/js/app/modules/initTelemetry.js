import { hook } from "../../core/dom.js";
import { RadarChart } from "../../features/telemetry/RadarChart.js";
import { PidChart } from "../../features/telemetry/PidChart.js";
import { SpectrumChart } from "../../features/telemetry/SpectrumChart.js";
import { TelemetrySimulation } from "../../features/telemetry/TelemetrySimulation.js";
import { RADAR_AXES, RADAR_BASELINE, RADAR_INITIAL_NAME, RADAR_SCENARIOS } from "../../data/radar.js";

/** @param {import("../App.js").AppContext} ctx */
export function initTelemetry({ use, i18n, store, viewport }) {
  const root = document.getElementById("telemetry");
  if (!root) return;

  const radar = new RadarChart(
    {
      grid: hook("radar-grid"),
      baseline: hook("radar-baseline"),
      shape: hook("radar-shape"),
      nodes: hook("radar-nodes"),
      labels: hook("radar-labels"),
      scenarioTag: hook("radar-scenario"),
      peak: hook("radar-peak"),
    },
    { axes: RADAR_AXES, baseline: RADAR_BASELINE, scenarios: RADAR_SCENARIOS, initialName: RADAR_INITIAL_NAME },
    i18n,
  );
  const pid = new PidChart(
    {
      outer: hook("pid-outer"),
      inner: hook("pid-inner"),
      area: hook("pid-area"),
      marker: hook("pid-marker"),
      meta: hook("pid-meta"),
      mode: hook("pid-mode"),
    },
    i18n,
  );
  const spectrum = new SpectrumChart({
    group: hook("spectrum-bars"),
    peak: hook("spectrum-peak"),
    latency: hook("spectrum-latency"),
  });

  use(
    root,
    (element) =>
      new TelemetrySimulation(element, {
        charts: { radar, pid, spectrum },
        panels: { radar: hook("radar-panel"), pid: hook("pid-panel"), spectrum: hook("spectrum-panel") },
        controls: {
          toggle: hook("sim-toggle"),
          toggleText: hook("sim-toggle-text"),
          resample: hook("sim-resample"),
          counter: hook("sim-cycle"),
        },
        i18n,
        store,
        viewport,
      }),
  );
}
