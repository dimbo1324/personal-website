import { randInt } from "../../core/animation";
import type { ProcessModel } from "./ProcessModel";

export interface ScadaElements {
  readonly window: HTMLElement;
  readonly pumpText: HTMLElement;
  readonly pumpButton: HTMLButtonElement;
  readonly esdText: HTMLElement;
  readonly esdButton: HTMLButtonElement;
  readonly mode: HTMLElement;
  readonly dot: HTMLElement;
  readonly unitPump: SVGElement;
  readonly unitValve: SVGElement;
  readonly unitGateway: SVGElement;
  readonly flows: readonly SVGElement[];
  readonly pumpStat: SVGTextElement;
  readonly valveStat: SVGTextElement;
  readonly tempStat: SVGTextElement;
  readonly esdStat: SVGTextElement;
  readonly pvReadout: HTMLElement;
  readonly setpointText: HTMLElement;
  readonly setpointInput: HTMLInputElement;
  readonly setpointLine: SVGLineElement;
  readonly trendLine: SVGPathElement;
  readonly trendArea: SVGPathElement;
}

/** Pure rendering of ProcessModel state into the SCADA window DOM. */
export class ScadaView {
  readonly #el: ScadaElements;

  constructor(elements: ScadaElements) {
    this.#el = elements;
  }

  render(model: ProcessModel): void {
    const { running, esdTripped, pumpOn, pv, setpoint, history } = model;
    const el = this.#el;

    el.window.classList.toggle("is-tripped", esdTripped);

    el.pumpText.textContent = pumpOn ? "Pump P-101: On" : "Pump P-101: Off";
    el.pumpButton.classList.toggle("is-on", pumpOn);
    el.esdText.textContent = esdTripped ? "SIS / ESD: Tripped" : "SIS / ESD: Armed";
    el.esdButton.classList.toggle("is-on", esdTripped);

    el.mode.textContent = esdTripped ? "· ESD trip" : running ? "· Running" : "· Standby";
    el.mode.className = `scada-window__mode ${esdTripped ? "text-rose" : running ? "text-accent" : "text-amber"}`;
    el.dot.classList.toggle("is-alarm", esdTripped);
    el.dot.classList.toggle("is-paused", !running && !esdTripped);

    el.unitPump.classList.toggle("is-on", running);
    el.unitValve.classList.toggle("is-on", running);
    el.unitGateway.classList.toggle("is-tripped", esdTripped);
    el.unitGateway.classList.toggle("is-on", !esdTripped);
    for (const flow of el.flows) flow.classList.toggle("is-stopped", !running);

    this.#text(
      el.pumpStat,
      running
        ? `RUN · ${Math.round(900 + pv * 7.4).toLocaleString("en-US")} RPM`
        : "STOPPED · 0 RPM",
      running ? "ok" : "off",
    );
    this.#text(
      el.valveStat,
      esdTripped ? "CLOSED · 0.0%" : `OPEN · ${pv.toFixed(1)}%`,
      esdTripped ? "alarm" : "ok",
    );
    el.tempStat.textContent = `${(185 + pv * 2.15).toFixed(1)} °C`;
    this.#text(
      el.esdStat,
      esdTripped ? "TRIP · INTERLOCK" : `ARMED · ${randInt(9, 15)} ms`,
      esdTripped ? "alarm" : "ok",
    );

    el.pvReadout.textContent = `PV ${pv.toFixed(1)}%`;
    el.setpointText.textContent = `${setpoint}%`;
    if (Number(el.setpointInput.value) !== setpoint) el.setpointInput.value = String(setpoint);

    this.#trend(history, setpoint);
  }

  #text(node: SVGTextElement, value: string, tone: string): void {
    node.textContent = value;
    node.setAttribute("class", `schematic__text schematic__text--${tone}`);
  }

  #trend(history: readonly number[], setpoint: number): void {
    const toY = (value: number): number => 58 - (Math.max(0, Math.min(100, value)) / 100) * 52;
    const setpointY = toY(setpoint).toFixed(1);
    this.#el.setpointLine.setAttribute("y1", setpointY);
    this.#el.setpointLine.setAttribute("y2", setpointY);

    const path = history
      .map(
        (value, index) =>
          `${index === 0 ? "M" : "L"}${((index / (history.length - 1)) * 320).toFixed(1)} ${toY(value).toFixed(1)}`,
      )
      .join(" ");
    this.#el.trendLine.setAttribute("d", path);
    this.#el.trendArea.setAttribute("d", `${path} L320 62 L0 62 Z`);
  }
}
