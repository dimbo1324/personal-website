import { rand, randInt } from "../../core/animation";

export interface PidResponse {
  readonly outer: number[];
  readonly inner: number[];
  readonly isStep: boolean;
  readonly meta: string;
  readonly markerIndex: number;
}

/** Generates a cascaded-PID response. Pure data — no DOM. */
export class PidModel {
  static readonly SAMPLES = 56;
  static readonly HORIZON_S = 60;
  static readonly Y_ZERO = 164;
  static readonly Y_SCALE = 102;

  generate(): PidResponse {
    const isStep = Math.random() > 0.45;
    const zeta = rand(0.09, 0.16);
    const omega = rand(0.15, 0.25);
    const disturbAt = rand(14, 28);
    const disturbAmp = rand(0.22, 0.42);

    const outer: number[] = [];
    const inner: number[] = [];
    let peak = 1;

    for (let index = 0; index <= PidModel.SAMPLES; index += 1) {
      const time = (index / PidModel.SAMPLES) * PidModel.HORIZON_S;
      let outputOuter: number;
      let outputInner: number;
      if (isStep) {
        outputOuter =
          1 -
          Math.exp(-zeta * time) *
            (Math.cos(omega * time) + (zeta / omega) * Math.sin(omega * time));
        outputInner = 1 - Math.exp(-zeta * 1.45 * time) * Math.cos(omega * 1.35 * time) * 0.9;
        outputOuter = Math.max(0, Math.min(1.2, outputOuter));
        outputInner = Math.max(0, Math.min(1.22, outputInner));
        peak = Math.max(peak, outputOuter);
      } else {
        const delta = time - disturbAt;
        outputOuter =
          time < disturbAt
            ? 1
            : 1 - disturbAmp * Math.exp(-zeta * 1.2 * delta) * Math.sin(omega * 1.2 * delta);
        outputInner =
          time < disturbAt
            ? 1
            : 1 - disturbAmp * 1.3 * Math.exp(-zeta * 1.7 * delta) * Math.sin(omega * 1.6 * delta);
      }
      outer.push(PidModel.Y_ZERO - outputOuter * PidModel.Y_SCALE);
      inner.push(PidModel.Y_ZERO - outputInner * PidModel.Y_SCALE);
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
        : Math.min(
            PidModel.SAMPLES - 4,
            Math.round((disturbAt / PidModel.HORIZON_S) * PidModel.SAMPLES) + 7,
          ),
    };
  }
}
