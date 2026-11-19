import { Component } from "../../core/Component.js";

/**
 * Orchestrates the three telemetry charts: live cycling, pause/resume,
 * resample, and per-panel "click to drive" interactions. Runs only while
 * the section is on screen.
 */
export class TelemetrySimulation extends Component {
  static CYCLE_MS = 3200;
  static SPECTRUM_MS = 1500;

  #charts;
  #panels;
  #controls;
  #cycleTimer = 0;
  #spectrumTimer = 0;
  #visible = false;

  /**
   * @param {HTMLElement} root  the telemetry section
   * @param {{ charts: { radar: import("./RadarChart.js").RadarChart, pid: import("./PidChart.js").PidChart, spectrum: import("./SpectrumChart.js").SpectrumChart },
   *           panels: { radar: HTMLElement, pid: HTMLElement, spectrum: HTMLElement },
   *           controls: { toggle: HTMLButtonElement, toggleText: HTMLElement, resample: HTMLButtonElement, counter: HTMLElement },
   *           store: import("../../core/Store.js").Store,
   *           viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options
   */
  constructor(root, { charts, panels, controls, store, viewport }) {
    super(root);
    this.#charts = charts;
    this.#panels = panels;
    this.#controls = controls;
    this.store = store;
    this.viewport = viewport;
  }

  mount() {
    const { toggle, resample } = this.#controls;
    this.on(toggle, "click", () => this.store.update("simRunning", (running) => !running));
    this.on(resample, "click", () => this.#cycle());

    this.#bindPanel(this.#panels.radar, () => this.#charts.radar.next());
    this.#bindPanel(this.#panels.pid, () => this.#charts.pid.next());
    this.#bindPanel(this.#panels.spectrum, () => this.#charts.spectrum.update({ burst: true }));

    this.own(this.store.subscribe("simRunning", (running) => this.#renderToggle(running)));
    this.own(this.store.subscribe("cycle", (cycle) => {
      this.#controls.counter.textContent = `Cycle #${String(cycle).padStart(3, "0")}`;
    }));
    this.own(
      this.viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#schedule();
      }),
    );
    return super.mount();
  }

  onDestroy() {
    this.#clearTimers();
    Object.values(this.#charts).forEach((chart) => chart.destroy?.());
  }

  #bindPanel(panel, action) {
    this.on(panel, "click", action);
    this.on(panel, "keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  }

  #cycle() {
    this.store.update("cycle", (cycle) => cycle + 1);
    this.#charts.radar.next();
    this.#charts.pid.next();
    this.#charts.spectrum.update();
  }

  #renderToggle(running) {
    const { toggle, toggleText } = this.#controls;
    toggleText.textContent = running ? "Live" : "Paused";
    toggle.classList.toggle("is-on", running);
    toggle.setAttribute("aria-pressed", String(running));
    this.#schedule();
  }

  #schedule() {
    this.#clearTimers();
    if (!this.#visible || !this.store.get("simRunning")) return;
    this.#cycleTimer = window.setInterval(() => this.#cycle(), TelemetrySimulation.CYCLE_MS);
    this.#spectrumTimer = window.setInterval(() => this.#charts.spectrum.update(), TelemetrySimulation.SPECTRUM_MS);
  }

  #clearTimers() {
    clearInterval(this.#cycleTimer);
    clearInterval(this.#spectrumTimer);
  }
}
