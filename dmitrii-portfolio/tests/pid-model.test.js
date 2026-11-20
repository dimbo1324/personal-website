import { test } from "node:test";
import assert from "node:assert/strict";
import { PidModel } from "../js/features/telemetry/PidModel.js";

test("PidModel generates consistent, in-range curves", () => {
  const model = new PidModel();
  for (let run = 0; run < 200; run += 1) {
    const result = model.generate();
    assert.equal(result.outer.length, PidModel.SAMPLES + 1);
    assert.equal(result.inner.length, PidModel.SAMPLES + 1);
    for (const y of [...result.outer, ...result.inner]) {
      assert.ok(Number.isFinite(y), "finite");
      assert.ok(y >= 0 && y <= PidModel.Y_ZERO + PidModel.Y_SCALE, `y=${y} inside the chart`);
    }
    assert.ok(result.markerIndex >= 0 && result.markerIndex <= PidModel.SAMPLES);
    assert.match(result.meta, result.isStep ? /^Ts \d+s · OS [\d.]+%$/ : /^Disturb @\d+s · −\d+%$/);
  }
});

test("a step response starts at the baseline", () => {
  const model = new PidModel();
  let result;
  do result = model.generate();
  while (!result.isStep);
  assert.equal(result.outer[0], PidModel.Y_ZERO);
});
