import { Component } from "../../core/component";
import type { Store } from "../../core/store";
import type { AppState } from "../../app/state";
import type { ViewportObserver } from "../../core/viewport";
import type { I18nService } from "../../i18n/service";
import type { PidChart } from "./PidChart";
import type { RadarChart } from "./RadarChart";
import type { SpectrumChart } from "./SpectrumChart";

interface TelemetryCharts {
  readonly radar: RadarChart;
  readonly pid: PidChart;
  readonly spectrum: SpectrumChart;
}

interface TelemetryControls {
  readonly toggle: HTMLButtonElement;
  readonly toggleText: HTMLElement;
  readonly resample: HTMLButtonElement;
  readonly counter: HTMLElement;
}

interface TelemetrySimulationOptions {
  readonly charts: TelemetryCharts;
  readonly panels: {
    readonly radar: HTMLElement;
    readonly pid: HTMLElement;
    readonly spectrum: HTMLElement;
  };
  readonly controls: TelemetryControls;
  readonly i18n: I18nService;
  readonly store: Store<AppState>;
  readonly viewport: ViewportObserver;
}

/** Orchestrates the three telemetry charts. Runs only while on screen. */
export class TelemetrySimulation extends Component<HTMLElement> {
  static readonly CYCLE_MS = 3200;
  static readonly SPECTRUM_MS = 1500;

  readonly #charts: TelemetryCharts;
  readonly #panels: TelemetrySimulationOptions["panels"];
  readonly #controls: TelemetryControls;
  readonly #i18n: I18nService;
  readonly #store: Store<AppState>;
  readonly #viewport: ViewportObserver;
  #cycleTimer = 0;
  #spectrumTimer = 0;
  #visible = false;

  constructor(
    root: HTMLElement,
    { charts, panels, controls, i18n, store, viewport }: TelemetrySimulationOptions,
  ) {
    super(root);
    this.#charts = charts;
    this.#panels = panels;
    this.#controls = controls;
    this.#i18n = i18n;
    this.#store = store;
    this.#viewport = viewport;
  }

  override mount(): this {
    const { toggle, resample } = this.#controls;
    this.on(toggle, "click", () => this.#store.update("simRunning", (running) => !running));
    this.on(resample, "click", () => this.#cycle());

    this.#bindPanel(this.#panels.radar, () => this.#charts.radar.next());
    this.#bindPanel(this.#panels.pid, () => this.#charts.pid.next());
    this.#bindPanel(this.#panels.spectrum, () => this.#charts.spectrum.update({ burst: true }));

    this.own(this.#store.subscribe("simRunning", (running) => this.#renderToggle(running)));
    this.own(this.#store.subscribe("cycle", () => this.#renderCounter()));
    this.own(
      this.#i18n.subscribe(() => {
        this.#renderCounter();
        this.#renderToggleText();
        this.#charts.radar.relabel();
        this.#charts.pid.relabel();
      }),
    );
    this.own(
      this.#viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#schedule();
      }),
    );
    return super.mount();
  }

  protected override onDestroy(): void {
    this.#clearTimers();
    this.#charts.radar.destroy();
    this.#charts.pid.destroy();
    this.#charts.spectrum.destroy();
  }

  #bindPanel(panel: HTMLElement, action: () => void): void {
    this.on(panel, "click", action);
    this.on(panel, "keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  }

  #cycle(): void {
    this.#store.update("cycle", (cycle) => cycle + 1);
    this.#charts.radar.next();
    this.#charts.pid.next();
    this.#charts.spectrum.update();
  }

  #renderCounter(): void {
    const cycle = String(this.#store.get("cycle")).padStart(3, "0");
    this.#controls.counter.textContent = this.#i18n.t("telemetry.cycle", { cycle });
  }

  #renderToggleText(): void {
    this.#controls.toggleText.textContent = this.#i18n.t(
      this.#store.get("simRunning") ? "telemetry.live" : "telemetry.paused",
    );
  }

  #renderToggle(running: boolean): void {
    const { toggle } = this.#controls;
    this.#renderToggleText();
    toggle.classList.toggle("is-on", running);
    toggle.setAttribute("aria-pressed", String(running));
    this.#schedule();
  }

  #schedule(): void {
    this.#clearTimers();
    if (!this.#visible || !this.#store.get("simRunning")) return;
    this.#cycleTimer = window.setInterval(() => this.#cycle(), TelemetrySimulation.CYCLE_MS);
    this.#spectrumTimer = window.setInterval(
      () => this.#charts.spectrum.update(),
      TelemetrySimulation.SPECTRUM_MS,
    );
  }

  #clearTimers(): void {
    window.clearInterval(this.#cycleTimer);
    window.clearInterval(this.#spectrumTimer);
  }
}
