import { rand, randInt } from "../../core/math.js";

/**
 * Generates a cascaded-PID response: either a damped step response or a
 * load-disturbance rejection. Pure data — no DOM.
 */
export class PidModel {
  static SAMPLES = 56;
  static HORIZON_S = 60;
  static Y_ZERO = 164;
  static Y_SCALE = 102;

  /** @returns {{ outer: number[], inner: number[], isStep: boolean, meta: string, markerIndex: number }} */
  generate() {
    const isStep = Math.random() > 0.45;
    const zeta = rand(0.09, 0.16);
    const omega = rand(0.15, 0.25);
    const disturbAt = rand(14, 28);
    const disturbAmp = rand(0.22, 0.42);

    const outer = [];
    const inner = [];
    let peak = 1;

    for (let i = 0; i <= PidModel.SAMPLES; i += 1) {
      const t = (i / PidModel.SAMPLES) * PidModel.HORIZON_S;
      let yo;
      let yi;
      if (isStep) {
        yo = 1 - Math.exp(-zeta * t) * (Math.cos(omega * t) + (zeta / omega) * Math.sin(omega * t));
        yi = 1 - Math.exp(-zeta * 1.45 * t) * Math.cos(omega * 1.35 * t) * 0.9;
        yo = Math.max(0, Math.min(1.2, yo));
        yi = Math.max(0, Math.min(1.22, yi));
        peak = Math.max(peak, yo);
      } else {
        const dt = t - disturbAt;
        yo = t < disturbAt ? 1 : 1 - disturbAmp * Math.exp(-zeta * 1.2 * dt) * Math.sin(omega * 1.2 * dt);
        yi = t < disturbAt ? 1 : 1 - disturbAmp * 1.3 * Math.exp(-zeta * 1.7 * dt) * Math.sin(omega * 1.6 * dt);
      }
      outer.push(PidModel.Y_ZERO - yo * PidModel.Y_SCALE);
      inner.push(PidModel.Y_ZERO - yi * PidModel.Y_SCALE);
    }

    return {
      outer,
      inner,
      isStep,
      meta: isStep
        ? `Ts ${Math.round(3.6 / zeta)}s · OS ${Math.max(0.5, (peak - 1) * 100).toFixed(1)}%`
        : `Disturb @${Math.round(disturbAt)}s · −${Math.round(disturbAmp * 100)}%`,
      markerIndex: isStep
        ? randInt(14, 30)
        : Math.min(PidModel.SAMPLES - 4, Math.round((disturbAt / PidModel.HORIZON_S) * PidModel.SAMPLES) + 7),
    };
  }
}
