import { clamp01, easeInOutCubic, easeOutCubic, lerp, rand } from "../../../core/animation";
import type { SampledCell } from "./ImageSampler";
import type { SerpentinePath } from "./SerpentinePath";
import { RenderTimeline as T } from "./RenderTimeline";

interface InkDot {
  readonly tx: number;
  readonly ty: number;
  readonly k: number;
  readonly sx: number;
  readonly sy: number;
  readonly color: string;
  readonly radius: number;
}

/** Fine halftone "ink" for one render, stamped once into an offscreen layer. */
export class HalftoneParticles {
  readonly #layer = document.createElement("canvas");
  readonly #layerContext = this.#layer.getContext("2d");
  #dots: InkDot[] = [];
  #landed = 0;
  #launched = 0;
  #size = { width: 0, height: 0 };

  resize(width: number, height: number, dpr: number): void {
    this.#size = { width, height };
    this.#layer.width = Math.round(width * dpr);
    this.#layer.height = Math.round(height * dpr);
    this.#layerContext?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  build(path: SerpentinePath, cells: readonly SampledCell[], isDark: boolean): void {
    const cell = Math.min(path.cellW, path.cellH);
    const dots: InkDot[] = [];

    for (let row = 0; row < path.rows; row += 1) {
      const bandIndex = path.bandOfRow(row);
      const band = path.band(bandIndex);
      const rowInBand = (row - band.r0) / Math.max(1, band.r1 - band.r0 - 1);

      for (let col = 0; col < path.cols; col += 1) {
        const source = cells[row * path.cols + col] ?? { r: 0, g: 0, b: 0, lum: 0 };
        const tx = (col + 0.5) * path.cellW;
        const ty = (row + 0.5) * path.cellH;
        const along = path.along(col, band.dir);
        const k =
          (bandIndex + along) / path.bands +
          ((rowInBand - 0.5) * 0.008 + rand(0, 0.006)) * band.dir;

        dots.push({
          tx,
          ty,
          k,
          sx: tx - band.dir * rand(24, 90),
          sy: lerp(band.yc, ty, rand(0.55, 0.85)),
          color: HalftoneParticles.#ink(source, isDark),
          radius: cell * (0.07 + source.lum * 0.13),
        });
      }
    }

    dots.sort((a, b) => a.k - b.k);
    this.#dots = dots;
    this.#landed = 0;
    this.#launched = 0;
    this.#layerContext?.clearRect(0, 0, this.#size.width, this.#size.height);
  }

  clear(): void {
    this.#dots = [];
    this.#landed = 0;
    this.#launched = 0;
  }

  draw(context: CanvasRenderingContext2D, rawT: number, headK: number, alpha: number): void {
    const dots = this.#dots;
    const fly = T.fly;
    const fade = 1 - easeInOutCubic(clamp01((rawT - T.dissolveStart) / T.dissolveSpan));
    if (fade <= 0 || dots.length === 0) return;

    const layer = this.#layerContext;
    if (!layer) return;

    while (this.#landed < dots.length && (dots[this.#landed]?.k ?? 0) <= headK - fly * 0.35) {
      const dot = dots[this.#landed];
      if (!dot) break;
      layer.fillStyle = dot.color;
      layer.beginPath();
      layer.arc(dot.tx, dot.ty, dot.radius, 0, Math.PI * 2);
      layer.fill();
      this.#landed += 1;
    }

    context.globalAlpha = alpha * fade;
    context.drawImage(this.#layer, 0, 0, this.#size.width, this.#size.height);

    while (this.#launched < dots.length && (dots[this.#launched]?.k ?? 0) - fly <= headK)
      this.#launched += 1;
    for (let index = this.#landed; index < this.#launched; index += 1) {
      const dot = dots[index];
      if (!dot) continue;
      const flight = clamp01((headK - (dot.k - fly)) / (fly * 1.35));
      const x = lerp(dot.sx, dot.tx, easeOutCubic(flight));
      const y = lerp(dot.sy, dot.ty, easeInOutCubic(flight));
      context.globalAlpha = alpha * fade * Math.min(1, flight * 2.5);
      context.fillStyle = dot.color;
      context.beginPath();
      context.arc(x, y, dot.radius * (1.6 - flight * 0.6), 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  static #ink({ r, g, b }: SampledCell, isDark: boolean): string {
    const mix = (channel: number, brand: number): number => Math.round(lerp(channel, brand, 0.22));
    if (isDark) return `rgb(${mix(r, 52)},${mix(g, 214)},${mix(b, 182)})`;
    return `rgb(${Math.round(mix(r, 11) * 0.62)},${Math.round(mix(g, 122) * 0.62)},${Math.round(mix(b, 102) * 0.62)})`;
  }
}
