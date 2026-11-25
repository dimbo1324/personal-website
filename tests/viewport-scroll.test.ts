// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ViewportObserver } from "../src/scripts/site/core/viewport";
import { ScrollService } from "../src/scripts/site/features/scroll/ScrollService";
import { RevealOnScroll } from "../src/scripts/site/features/scroll/RevealOnScroll";
import { stubIntersectionObserver } from "./helpers/dom";

let observers: ReturnType<typeof stubIntersectionObserver>;

beforeEach(() => {
  observers = stubIntersectionObserver();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback): number => {
    callback(0);
    return 1;
  });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
  document.documentElement.className = "";
});

describe("ViewportObserver", () => {
  it("routes intersection entries to the right callback and unwatches", () => {
    const observer = new ViewportObserver({ threshold: 0.02 });
    const firstTarget = document.createElement("div");
    const secondTarget = document.createElement("div");
    const first = vi.fn();
    const second = vi.fn();
    const unwatch = observer.watch(firstTarget, first);
    observer.watch(secondTarget, second);
    observers.instances[0]?.emit(true);
    expect(first).toHaveBeenCalled();
    expect(second).toHaveBeenCalled();

    unwatch();
    observers.instances[0]?.emit(false);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    observer.disconnect();
  });
});

describe("ScrollService", () => {
  it("measures progress and notifies subscribers", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 250 });

    const service = new ScrollService();
    const listener = vi.fn();
    const dispose = service.start();
    service.subscribe(listener);
    expect(service.state).toEqual({ y: 250, progress: 0.25, viewportHeight: 1000 });
    expect(listener).toHaveBeenCalledWith(service.state);

    window.dispatchEvent(new Event("scroll"));
    expect(listener).toHaveBeenCalled();
    dispose();
  });
});

describe("RevealOnScroll", () => {
  it("adds is-inview when elements enter the viewport", () => {
    const root = document.createElement("div");
    document.body.append(root);
    new RevealOnScroll([root]).start();
    expect(document.documentElement.classList.contains("js-ready")).toBe(true);
    observers.instances[0]?.emit(true);
    expect(root.classList.contains("is-inview")).toBe(true);
  });
});
