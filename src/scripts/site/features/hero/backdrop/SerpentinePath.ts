import { clamp01 } from "../../../core/animation";

export interface SerpentineGrid {
  readonly width: number;
  readonly height: number;
  readonly cols: number;
  readonly rows: number;
  readonly bands: number;
}

export interface BandGeometry {
  readonly r0: number;
  readonly r1: number;
  readonly y0: number;
  readonly y1: number;
  readonly yc: number;
  readonly dir: number;
}

export type HeadPosition = BandGeometry & {
  readonly x: number;
  readonly band: number;
  readonly along: number;
};

/** Geometry of the boustrophedon sweep used by the backdrop render. */
export class SerpentinePath {
  readonly width: number;
  readonly height: number;
  readonly cols: number;
  readonly rows: number;
  readonly bands: number;
  readonly rowsPerBand: number;
  readonly cellW: number;
  readonly cellH: number;

  constructor({ width, height, cols, rows, bands }: SerpentineGrid) {
    this.width = width;
    this.height = height;
    this.cols = cols;
    this.rows = rows;
    this.bands = bands;
    this.rowsPerBand = Math.ceil(rows / bands);
    this.cellW = width / cols;
    this.cellH = height / rows;
  }

  bandOfRow(row: number): number {
    return Math.floor(row / this.rowsPerBand);
  }

  band(band: number): BandGeometry {
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

  along(col: number, dir: number): number {
    const fraction = (col + 0.5) / this.cols;
    return dir === 1 ? fraction : 1 - fraction;
  }

  headAt(k: number): HeadPosition {
    const progress = clamp01(k);
    const band = Math.min(this.bands - 1, Math.floor(progress * this.bands));
    const along = progress * this.bands - band;
    const geometry = this.band(band);
    const x = geometry.dir === 1 ? along * this.width : (1 - along) * this.width;
    return { x, band, along, ...geometry };
  }
}
