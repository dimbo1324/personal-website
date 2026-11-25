import { ticker } from "../../../core/ticker";
import { AmbientField } from "./AmbientField";
import { HalftoneParticles } from "./HalftoneParticles";
import { ImageSampler } from "./ImageSampler";
import type { SampledCell } from "./ImageSampler";
import { PrintHead } from "./PrintHead";
import { RenderTimeline as T } from "./RenderTimeline";
import { SerpentinePath } from "./SerpentinePath";
import type { SerpentineGrid } from "./SerpentinePath";

type RasterGrid = Pick<SerpentineGrid, "cols" | "rows" | "bands">;

interface RenderJob {
  readonly from: number;
  readonly to: number;
  readonly start: number;
  readonly onFrame: (rawT: number, headK: number) => void;
  readonly onComplete: () => void;
}

interface RendererOptions {
  readonly isDark: () => boolean;
  readonly ambient: boolean;
  readonly ambientFps?: number;
}

/** Canvas owner and frame loop for the hero backdrop. */
export class RasterRenderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  readonly #dpr = Math.min(window.devicePixelRatio || 1, 2);
  #size = { width: 0, height: 0 };
  #grid: RasterGrid = { cols: 160, rows: 100, bands: 6 };
  #path: SerpentinePath | null = null;

  readonly #particles = new HalftoneParticles();
  readonly #head = new PrintHead();
  readonly #ambient = new AmbientField();
  readonly #sampler = new ImageSampler();

  readonly #isDark: () => boolean;
  readonly #ambientEnabled: boolean;
  readonly #ambientInterval: number;
  #lastAmbient = 0;
  #removeTick: (() => void) | null = null;
  #job: RenderJob | null = null;

  constructor(canvas: HTMLCanvasElement, { isDark, ambient, ambientFps = 30 }: RendererOptions) {
    const context = canvas.getContext("2d");
    if (!context) throw new TypeError("RasterRenderer: 2D canvas context is required");
    this.#canvas = canvas;
    this.#context = context;
    this.#isDark = isDark;
    this.#ambientEnabled = ambient;
    this.#ambientInterval = 1000 / ambientFps;
  }

  static gridFor(width: number, height: number): RasterGrid {
    const small = width < 768;
    const cell = Math.max(small ? 8 : 9, Math.sqrt((width * height) / 20000));
    return { cols: Math.ceil(width / cell), rows: Math.ceil(height / cell), bands: small ? 5 : 6 };
  }

  get passes(): number {
    return this.#grid.bands;
  }

  get isBusy(): boolean {
    return this.#job !== null;
  }

  resize(width: number, height: number): void {
    this.#size = {
      width: Math.max(320, Math.round(width)),
      height: Math.max(400, Math.round(height)),
    };
    this.#grid = RasterRenderer.gridFor(this.#size.width, this.#size.height);

    this.#canvas.width = Math.round(this.#size.width * this.#dpr);
    this.#canvas.height = Math.round(this.#size.height * this.#dpr);
    this.#context.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);

    this.#path = new SerpentinePath({ ...this.#size, ...this.#grid });
    this.#particles.resize(this.#size.width, this.#size.height, this.#dpr);
    this.#sampler.clear();
    this.#ambient.build(this.#size.width, this.#size.height);
  }

  setActive(active: boolean): void {
    if (active && !this.#removeTick) this.#removeTick = ticker.add((now) => this.#frame(now));
    if (!active && this.#removeTick) {
      this.#removeTick();
      this.#removeTick = null;
    }
  }

  render({
    image,
    index,
    from,
    onFrame,
    onComplete,
  }: {
    readonly image: HTMLImageElement | undefined;
    readonly index: number;
    readonly from: number;
    readonly onFrame: (rawT: number, headK: number) => void;
    readonly onComplete: () => void;
  }): void {
    const path = this.#path;
    if (!path) return;
    const cells: readonly SampledCell[] = this.#sampler.sample(image, index, {
      ...this.#size,
      ...this.#grid,
    });
    this.#particles.build(path, cells, this.#isDark());
    this.#head.reset();
    this.#job = { from, to: index, start: performance.now(), onFrame, onComplete };
  }

  destroy(): void {
    this.setActive(false);
  }

  #frame(now: number): void {
    const { width, height } = this.#size;
    const context = this.#context;
    const isDark = this.#isDark();

    if (this.#job) {
      context.clearRect(0, 0, width, height);
      this.#drawJob(context, now, isDark);
    } else if (this.#ambientEnabled) {
      if (now - this.#lastAmbient < this.#ambientInterval) return;
      this.#lastAmbient = now;
      context.clearRect(0, 0, width, height);
      this.#ambient.draw(context, now, width, height, isDark);
    }
  }

  #drawJob(context: CanvasRenderingContext2D, now: number, isDark: boolean): void {
    const job = this.#job;
    const path = this.#path;
    if (!job || !path) return;
    const rawT = Math.min(1, (now - job.start) / T.DURATION_MS);
    const headK = T.headProgress(rawT);

    job.onFrame(rawT, headK);
    this.#particles.draw(context, rawT, headK, isDark ? 0.72 : 0.6);

    if (headK > 0 && headK < 1) {
      const edgeFade = Math.min(1, headK * 30, (1 - headK) * 30);
      this.#head.draw(context, path.headAt(headK), isDark, edgeFade);
    }

    if (rawT >= 1) {
      this.#particles.clear();
      this.#job = null;
      job.onComplete();
    }
  }
}
