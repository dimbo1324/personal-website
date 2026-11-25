import { vi } from "vitest";

export function setBody(html: string): void {
  document.body.innerHTML = html;
}

export function stubMatchMedia(matches = false): void {
  vi.stubGlobal(
    "matchMedia",
    (query: string): MediaQueryList =>
      ({
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

export function stubAnimationFrame(): { tick(now: number): void } {
  let callback: FrameRequestCallback | null = null;
  vi.stubGlobal("requestAnimationFrame", (next: FrameRequestCallback): number => {
    callback = next;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  return {
    tick(now: number): void {
      callback?.(now);
    },
  };
}

export interface FakeObserver {
  callback: IntersectionObserverCallback;
  targets: Element[];
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  emit(isIntersecting: boolean): void;
}

export function stubIntersectionObserver(): { instances: FakeObserver[] } {
  const instances: FakeObserver[] = [];
  class FakeIntersectionObserver {
    readonly callback: IntersectionObserverCallback;
    readonly targets: Element[] = [];
    readonly observe = vi.fn((target: Element): void => {
      this.targets.push(target);
    });
    readonly unobserve = vi.fn();
    readonly disconnect = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      instances.push(this as unknown as FakeObserver);
    }

    emit(isIntersecting: boolean): void {
      const entries = this.targets.map(
        (target) => ({ isIntersecting, target }) as unknown as IntersectionObserverEntry,
      );
      this.callback(entries, this as unknown as IntersectionObserver);
    }
  }
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  return { instances };
}

export function stubCanvasContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: vi.fn() } as unknown as CanvasGradient;
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    createRadialGradient: vi.fn(() => gradient),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) }) as unknown as ImageData),
    fillRect: vi.fn(),
    fillStyle: "",
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  return context;
}

export function stubElementAnimation(): void {
  const original = Element.prototype.animate;
  const animation = {
    finished: Promise.resolve(),
    cancel: vi.fn(),
  } as unknown as Animation;
  Element.prototype.animate = vi.fn(() => animation);
  vi.stubGlobal("restoreElementAnimation", () => {
    Element.prototype.animate = original;
  });
}

export function restoreElementAnimation(): void {
  const restore = (globalThis as unknown as { restoreElementAnimation?: () => void })
    .restoreElementAnimation;
  restore?.();
}
