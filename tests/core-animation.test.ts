import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clamp,
  clamp01,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  lerp,
  mapRange,
  rand,
  randInt,
} from "../src/scripts/site/core/animation";
import { ticker } from "../src/scripts/site/core/ticker";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("animation helpers", () => {
  it("clamps values to the requested range", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-5, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(-1)).toBe(0);
  });

  it("interpolates and maps ranges", () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(mapRange(5, 0, 10, 100, 200)).toBe(150);
  });

  it("generates numbers inside the requested bounds", () => {
    for (let index = 0; index < 100; index += 1) {
      const value = rand(-2, 4);
      expect(value).toBeGreaterThanOrEqual(-2);
      expect(value).toBeLessThan(4);
      expect(randInt(1, 3)).toBeGreaterThanOrEqual(1);
      expect(randInt(1, 3)).toBeLessThanOrEqual(3);
    }
  });

  it("uses the documented easing curves", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
    expect(easeOutBack(0)).toBeCloseTo(0);
    expect(easeOutBack(1)).toBeCloseTo(1);
  });
});

describe("ticker", () => {
  it("fans frames out to every subscriber and stops when none remain", () => {
    let frame: (now: number) => void = () => undefined;
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: (now: number) => void): number => {
      frame = callback;
      return 7;
    });
    vi.stubGlobal("cancelAnimationFrame", cancel);

    const first = vi.fn();
    const second = vi.fn();
    const removeFirst = ticker.add(first);
    ticker.add(second);
    frame?.(100);
    expect(first).toHaveBeenCalledWith(100);
    expect(second).toHaveBeenCalledWith(100);

    removeFirst();
    frame?.(200);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);

    ticker.remove(second);
    expect(cancel).toHaveBeenCalledWith(7);
  });
});
