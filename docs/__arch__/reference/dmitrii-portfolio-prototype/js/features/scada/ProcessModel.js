import { rand } from "../../core/math.js";

/**
 * First-order plant with a P-like controller, noise and decaying load
 * disturbances. Holds the operator state (pump, ESD, setpoint) and enforces
 * interlocks: the pump cannot start while the ESD is tripped.
 */
export class ProcessModel {
  static HISTORY = 40;
  static GAIN = 0.24;
  static DISTURBANCE_DECAY = 0.72;

  #listeners = new Set();

  constructor({ setpoint = 76 } = {}) {
    this.pumpOn = true;
    this.esdTripped = false;
    this.setpoint = setpoint;
    this.pv = setpoint;
    this.disturbance = 0;
    this.history = Array.from({ length: ProcessModel.HISTORY }, () => setpoint);
  }

  get running() {
    return this.pumpOn && !this.esdTripped;
  }

  /** @param {(model: ProcessModel) => void} listener */
  onChange(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /** @returns {{ ok: boolean, message: string }} */
  togglePump() {
    if (this.esdTripped) return { ok: false, message: "Blocked: reset SIS/ESD before starting P-101" };
    this.pumpOn = !this.pumpOn;
    this.#emit();
    return { ok: true, message: `P-101 command → ${this.pumpOn ? "START" : "STOP"}` };
  }

  toggleEsd() {
    this.esdTripped = !this.esdTripped;
    this.#emit();
    return {
      ok: true,
      message: this.esdTripped ? "SIS/ESD TRIPPED — CV-301 fail-safe closed" : "SIS/ESD reset — interlock armed",
    };
  }

  setSetpoint(value) {
    this.setpoint = value;
    this.#emit();
  }

  /** Step the valve setpoint like an operator clicking the faceplate. */
  stepValve() {
    this.setSetpoint(this.setpoint >= 90 ? 50 : this.setpoint + 12);
    return { ok: true, message: `CV-301 setpoint → ${this.setpoint}%` };
  }

  injectDisturbance() {
    this.disturbance = rand(-22, -12);
    return { ok: true, message: "Injected thermal load disturbance into ODE vessel" };
  }

  /** Advance the simulation by one sample. */
  step() {
    const target = this.running ? this.setpoint : 0;
    const noise = this.running ? rand(-0.7, 0.7) : 0;
    this.disturbance *= ProcessModel.DISTURBANCE_DECAY;
    this.pv = Math.max(0, Math.min(100, this.pv + (target - this.pv) * ProcessModel.GAIN + this.disturbance * 0.35 + noise));
    this.history.shift();
    this.history.push(this.pv);
    this.#emit();
  }

  #emit() {
    this.#listeners.forEach((listener) => listener(this));
  }
}
