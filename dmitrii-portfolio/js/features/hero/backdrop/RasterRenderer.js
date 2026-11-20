import { ticker } from "../../../core/Ticker.js";
import { RenderTimeline as T } from "./RenderTimeline.js";
import { SerpentinePath } from "./SerpentinePath.js";
import { HalftoneParticles } from "./HalftoneParticles.js";
import { PrintHead } from "./PrintHead.js";
import { AmbientField } from "./AmbientField.js";
import { ImageSampler } from "./ImageSampler.js";

/**
 * Canvas owner and frame loop for the hero backdrop.
 * Knows nothing about buttons or status text — it reports progress through
 * callbacks and lets the controller decide what to show.
 */
export class RasterRenderer {
  #canvas;
  #context;
  #dpr = Math.min(window.devicePixelRatio || 1, 2);
  #size = { width: 0, height: 0 };
  #grid = { cols: 160, rows: 100, bands: 6 };
  #path = null;

  #particles = new HalftoneParticles();
  #head = new PrintHead();
  #ambient = new AmbientField();
  #sampler = new ImageSampler();

  #isDark;
  #ambientEnabled;
  #ambientInterval;
  #lastAmbient = 0;
  #removeTick = null;
  #job = null; // { from, to, start, onFrame, onComplete }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ isDark: () => boolean, ambient: boolean, ambientFps?: number }} options
   */
  constructor(canvas, { isDark, ambient, ambientFps = 30 }) {
    this.#ambientInterval = 1000 / ambientFps;
    this.#canvas = canvas;
    this.#context = canvas.getContext("2d");
    this.#isDark = isDark;
    this.#ambientEnabled = ambient;
  }

  /**
   * Fine grid: ~9 px cells, capped at ~20k dots so huge screens stay smooth.
   * @returns {{ cols: number, rows: number, bands: number }}
   */
  static gridFor(width, height) {
    const small = width < 768;
    const cell = Math.max(small ? 8 : 9, Math.sqrt((width * height) / 20000));
    return { cols: Math.ceil(width / cell), rows: Math.ceil(height / cell), bands: small ? 5 : 6 };
  }

  /** Number of serpentine passes for the current viewport. */
  get passes() {
    return this.#grid.bands;
  }

  get isBusy() {
    return this.#job !== null;
  }

  /** @param {number} width @param {number} height */
  resize(width, height) {
    this.#size = { width: Math.max(320, Math.round(width)), height: Math.max(400, Math.round(height)) };
    this.#grid = RasterRenderer.gridFor(this.#size.width, this.#size.height);

    this.#canvas.width = Math.round(this.#size.width * this.#dpr);
    this.#canvas.height = Math.round(this.#size.height * this.#dpr);
    this.#context.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);

    this.#path = new SerpentinePath({ ...this.#size, ...this.#grid });
    this.#particles.resize(this.#size.width, this.#size.height, this.#dpr);
    this.#sampler.clear();
    this.#ambient.build(this.#size.width, this.#size.height);
  }

  /** Start/stop drawing (paused while the hero is off-screen). */
  setActive(active) {
    if (active && !this.#removeTick) this.#removeTick = ticker.add((now) => this.#frame(now));
    if (!active && this.#removeTick) {
      this.#removeTick();
      this.#removeTick = null;
    }
  }

  /**
   * @param {{ image: HTMLImageElement, index: number, from: number,
   *           onFrame: (rawT: number, headK: number) => void, onComplete: () => void }} job
   */
  render({ image, index, from, onFrame, onComplete }) {
    const cells = this.#sampler.sample(image, index, { ...this.#size, ...this.#grid });
    this.#particles.build(this.#path, cells, this.#isDark());
    this.#head.reset();
    this.#job = { from, to: index, start: performance.now(), onFrame, onComplete };
  }

  destroy() {
    this.setActive(false);
  }

  #frame(now) {
    const { width, height } = this.#size;
    const context = this.#context;
    const isDark = this.#isDark();

    if (this.#job) {
      context.clearRect(0, 0, width, height);
      this.#drawJob(context, now, isDark);
    } else if (this.#ambientEnabled) {
      // the idle field is decoration: drawn at a reduced frame rate (effects budget)
      if (now - this.#lastAmbient < this.#ambientInterval) return;
      this.#lastAmbient = now;
      context.clearRect(0, 0, width, height);
      this.#ambient.draw(context, now, width, height, isDark);
    }
  }

  #drawJob(context, now, isDark) {
    const job = this.#job;
    const rawT = Math.min(1, (now - job.start) / T.DURATION_MS);
    const headK = T.headProgress(rawT);

    job.onFrame(rawT, headK);
    this.#particles.draw(context, rawT, headK, isDark ? 0.72 : 0.6);

    if (headK > 0 && headK < 1) {
      const edgeFade = Math.min(1, headK * 30, (1 - headK) * 30);
      this.#head.draw(context, this.#path.headAt(headK), isDark, edgeFade);
    }

    if (rawT >= 1) {
      this.#particles.clear();
      this.#job = null;
      job.onComplete();
    }
  }
}
