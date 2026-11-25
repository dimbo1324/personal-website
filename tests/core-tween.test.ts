import { afterEach, describe, expect, it, vi } from "vitest";
import { tween } from "../src/scripts/site/core/tween";
import { easeOutCubic } from "../src/scripts/site/core/animation";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("tween", () => {
  it("reports eased progress and completes at the end", () => {
    let frame: (now: number) => void = () => undefined;
    vi.stubGlobal("requestAnimationFrame", (callback: (now: number) => void): number => {
      frame = callback;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(performance, "now").mockReturnValue(0);

    const onUpdate = vi.fn();
    const onComplete = vi.fn();
    tween({ duration: 100, onUpdate, onComplete });

    frame?.(50);
    expect(onUpdate).toHaveBeenCalledWith(easeOutCubic(0.5));
    frame?.(100);
    expect(onUpdate).toHaveBeenLastCalledWith(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("can be cancelled before completion", () => {
    let frame: (now: number) => void = () => undefined;
    const cancelAnimation = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: (now: number) => void): number => {
      frame = callback;
      return 2;
    });
    vi.stubGlobal("cancelAnimationFrame", cancelAnimation);
    vi.spyOn(performance, "now").mockReturnValue(0);

    const onUpdate = vi.fn();
    const cancel = tween({ duration: 100, onUpdate });
    cancel();
    frame?.(50);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(cancelAnimation).toHaveBeenCalled();
  });
});
