import { rand } from "../../core/animation";

export type ActionResult =
  | { readonly ok: true; readonly message: string }
  | { readonly ok: false; readonly message: string };

/**
 * First-order plant with a P-like controller, noise and decaying load
 * disturbances. Holds the operator state and enforces interlocks.
 */
export class ProcessModel {
  static readonly HISTORY = 40;
  static readonly GAIN = 0.24;
  static readonly DISTURBANCE_DECAY = 0.72;

  readonly #listeners = new Set<(model: ProcessModel) => void>();
  pumpOn = true;
  esdTripped = false;
  setpoint: number;
  pv: number;
  disturbance = 0;
  history: number[];

  constructor({ setpoint = 76 }: { readonly setpoint?: number } = {}) {
    this.setpoint = setpoint;
    this.pv = setpoint;
    this.history = Array.from({ length: ProcessModel.HISTORY }, () => setpoint);
  }

  get running(): boolean {
    return this.pumpOn && !this.esdTripped;
  }

  onChange(listener: (model: ProcessModel) => void): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  togglePump(): ActionResult {
    if (this.esdTripped)
      return { ok: false, message: "Blocked: reset SIS/ESD before starting P-101" };
    this.pumpOn = !this.pumpOn;
    this.#emit();
    return { ok: true, message: `P-101 command → ${this.pumpOn ? "START" : "STOP"}` };
  }

  toggleEsd(): ActionResult {
    this.esdTripped = !this.esdTripped;
    this.#emit();
    return {
      ok: true,
      message: this.esdTripped
        ? "SIS/ESD TRIPPED — CV-301 fail-safe closed"
        : "SIS/ESD reset — interlock armed",
    };
  }

  setSetpoint(value: number): void {
    this.setpoint = value;
    this.#emit();
  }

  stepValve(): ActionResult {
    this.setSetpoint(this.setpoint >= 90 ? 50 : this.setpoint + 12);
    return { ok: true, message: `CV-301 setpoint → ${this.setpoint}%` };
  }

  injectDisturbance(): ActionResult {
    this.disturbance = rand(-22, -12);
    return { ok: true, message: "Injected thermal load disturbance into ODE vessel" };
  }

  step(): void {
    const target = this.running ? this.setpoint : 0;
    const noise = this.running ? rand(-0.7, 0.7) : 0;
    this.disturbance *= ProcessModel.DISTURBANCE_DECAY;
    this.pv = Math.max(
      0,
      Math.min(
        100,
        this.pv + (target - this.pv) * ProcessModel.GAIN + this.disturbance * 0.35 + noise,
      ),
    );
    this.history.shift();
    this.history.push(this.pv);
    this.#emit();
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this);
  }
}
