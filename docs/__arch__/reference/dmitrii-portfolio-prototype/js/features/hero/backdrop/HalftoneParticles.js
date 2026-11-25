import { RenderTimeline as T } from "./RenderTimeline.js";
import { clamp01, lerp, rand } from "../../../core/math.js";
import { easeOutCubic, easeInOutCubic } from "../../../core/easing.js";

/**
 * Fine halftone "ink" for one render.
 *
 * Thousands of tiny dots (≈1–3 px) are launched just behind the print head,
 * ride along the sweep and settle into a dense grid that reproduces the photo.
 * Performance: dots are sorted by arrival; once a dot lands it is stamped
 * ONCE into an offscreen layer, so every frame only draws one bitmap plus the
 * handful of dots that are still in flight.
 */
export class HalftoneParticles {
  /** @type {{ tx:number, ty:number, k:number, sx:number, sy:number, color:string, radius:number }[]} */
  #dots = [];
  #layer = document.createElement("canvas");
  #layerContext = this.#layer.getContext("2d");
  #landed = 0;
  #launched = 0;
  #size = { width: 0, height: 0 };

  /** Match the offscreen layer to the visible canvas. */
  resize(width, height, dpr) {
    this.#size = { width, height };
    this.#layer.width = Math.round(width * dpr);
    this.#layer.height = Math.round(height * dpr);
    this.#layerContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * @param {import("./SerpentinePath.js").SerpentinePath} path
   * @param {{ r:number, g:number, b:number, lum:number }[]} cells
   * @param {boolean} isDark  ink is lightened on dark themes, deepened on light
   */
  build(path, cells, isDark) {
    const cell = Math.min(path.cellW, path.cellH);
    const dots = [];

    for (let row = 0; row < path.rows; row += 1) {
      const bandIndex = path.bandOfRow(row);
      const band = path.band(bandIndex);
      const rowInBand = (row - band.r0) / Math.max(1, band.r1 - band.r0 - 1);

      for (let col = 0; col < path.cols; col += 1) {
        const source = cells[row * path.cols + col];
        const tx = (col + 0.5) * path.cellW;
        const ty = (row + 0.5) * path.cellH;
        const along = path.along(col, band.dir);
        const k = (bandIndex + along) / path.bands + ((rowInBand - 0.5) * 0.008 + rand(0, 0.006)) * band.dir;

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
    this.#layerContext.clearRect(0, 0, this.#size.width, this.#size.height);
  }

  clear() {
    this.#dots = [];
    this.#landed = 0;
    this.#launched = 0;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} rawT   timeline position 0..1
   * @param {number} headK  print-head progress
   * @param {number} alpha  base opacity for the theme
   */
  draw(context, rawT, headK, alpha) {
    const dots = this.#dots;
    const fly = T.fly;
    const fade = 1 - easeInOutCubic(clamp01((rawT - T.dissolveStart) / T.dissolveSpan));
    if (fade <= 0 || dots.length === 0) return;

    // 1. stamp every dot that has landed since the last frame
    const layer = this.#layerContext;
    while (this.#landed < dots.length && dots[this.#landed].k <= headK - fly * 0.35) {
      const dot = dots[this.#landed];
      layer.fillStyle = dot.color;
      layer.beginPath();
      layer.arc(dot.tx, dot.ty, dot.radius, 0, Math.PI * 2);
      layer.fill();
      this.#landed += 1;
    }

    // 2. the settled picture in one draw call
    context.globalAlpha = alpha * fade;
    context.drawImage(this.#layer, 0, 0, this.#size.width, this.#size.height);

    // 3. dots still travelling with the head
    while (this.#launched < dots.length && dots[this.#launched].k - fly <= headK) this.#launched += 1;
    for (let i = this.#landed; i < this.#launched; i += 1) {
      const dot = dots[i];
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

  static #ink({ r, g, b }, isDark) {
    // nudge every colour 22 % towards the brand teal so the render reads
    // as one cohesive layer instead of raw photo noise
    const mix = (channel, brand) => Math.round(lerp(channel, brand, 0.22));
    if (isDark) return `rgb(${mix(r, 52)},${mix(g, 214)},${mix(b, 182)})`;
    return `rgb(${Math.round(mix(r, 11) * 0.62)},${Math.round(mix(g, 122) * 0.62)},${Math.round(mix(b, 102) * 0.62)})`;
  }
}
