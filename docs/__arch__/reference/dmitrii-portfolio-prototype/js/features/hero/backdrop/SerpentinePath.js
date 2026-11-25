import { clamp01 } from "../../../core/math.js";

/**
 * Geometry of the boustrophedon sweep: the canvas is split into horizontal
 * bands; even bands are printed left → right, odd bands right → left.
 */
export class SerpentinePath {
  /**
   * @param {{ width: number, height: number, cols: number, rows: number, bands: number }} grid
   */
  constructor({ width, height, cols, rows, bands }) {
    this.width = width;
    this.height = height;
    this.cols = cols;
    this.rows = rows;
    this.bands = bands;
    this.rowsPerBand = Math.ceil(rows / bands);
    this.cellW = width / cols;
    this.cellH = height / rows;
  }

  bandOfRow(row) {
    return Math.floor(row / this.rowsPerBand);
  }

  /** @param {number} band */
  band(band) {
    const r0 = band * this.rowsPerBand;
    const r1 = Math.min(this.rows, r0 + this.rowsPerBand);
    return {
      r0,
      r1,
      y0: r0 * this.cellH,
      y1: r1 * this.cellH,
      yc: ((r0 + r1) / 2) * this.cellH,
      dir: band % 2 === 0 ? 1 : -1,
    };
  }

  /** Normalised distance along a band for a column, respecting direction. */
  along(col, dir) {
    const xf = (col + 0.5) / this.cols;
    return dir === 1 ? xf : 1 - xf;
  }

  /** Position of the print head for head-progress k ∈ [0, 1]. */
  headAt(k) {
    const progress = clamp01(k);
    const band = Math.min(this.bands - 1, Math.floor(progress * this.bands));
    const along = progress * this.bands - band;
    const geometry = this.band(band);
    const x = geometry.dir === 1 ? along * this.width : (1 - along) * this.width;
    return { x, band, along, ...geometry };
  }
}
