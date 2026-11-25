export interface SampledCell {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly lum: number;
}

export interface SampleGrid {
  readonly width: number;
  readonly height: number;
  readonly cols: number;
  readonly rows: number;
}

/** Samples an <img> into a colour grid using the same crop as object-fit: cover. */
export class ImageSampler {
  static readonly FALLBACK_PALETTE = [
    [36, 184, 155],
    [52, 214, 182],
    [107, 136, 150],
    [184, 214, 222],
    [242, 153, 74],
  ] as const;

  readonly #cache = new Map<string, readonly SampledCell[]>();

  clear(): void {
    this.#cache.clear();
  }

  sample(
    image: HTMLImageElement | undefined,
    index: number,
    grid: SampleGrid,
  ): readonly SampledCell[] {
    const { width, height, cols, rows } = grid;
    const key = `${index}:${cols}x${rows}:${width}x${height}`;
    const cached = this.#cache.get(key);
    if (cached) return cached;

    const cells = this.#readPixels(image, grid) ?? this.#fallback(index, cols, rows);
    this.#cache.set(key, cells);
    return cells;
  }

  #readPixels(
    image: HTMLImageElement | undefined,
    { width, height, cols, rows }: SampleGrid,
  ): readonly SampledCell[] | null {
    if (!image?.complete || !image.naturalWidth) return null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = cols;
      canvas.height = rows;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return null;
      const crop = ImageSampler.coverCrop(image.naturalWidth, image.naturalHeight, width, height);
      context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, cols, rows);
      const data = context.getImageData(0, 0, cols, rows).data;

      const cells: SampledCell[] = [];
      for (let index = 0; index < cols * rows; index += 1) {
        const red = data[index * 4] ?? 0;
        const green = data[index * 4 + 1] ?? 0;
        const blue = data[index * 4 + 2] ?? 0;
        cells.push({
          r: Math.min(255, Math.round(red * 0.86 + 30)),
          g: Math.min(255, Math.round(green * 0.92 + 36)),
          b: Math.min(255, Math.round(blue * 0.9 + 34)),
          lum: (0.299 * red + 0.587 * green + 0.114 * blue) / 255,
        });
      }
      return cells;
    } catch {
      return null;
    }
  }

  #fallback(index: number, cols: number, rows: number): SampledCell[] {
    const palette = ImageSampler.FALLBACK_PALETTE;
    const cells: SampledCell[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const wave = Math.sin(col * 0.22 + index * 2) * Math.cos(row * 0.27 + index);
        const paletteIndex =
          Math.abs(Math.floor((wave + 1) * 1.6 + (col + row) * 0.05)) % palette.length;
        const [red, green, blue] = palette[paletteIndex] ?? [0, 0, 0];
        cells.push({ r: red, g: green, b: blue, lum: 0.3 + 0.35 * Math.abs(wave) });
      }
    }
    return cells;
  }

  static coverCrop(
    naturalWidth: number,
    naturalHeight: number,
    targetWidth: number,
    targetHeight: number,
  ): { readonly sx: number; readonly sy: number; readonly sw: number; readonly sh: number } {
    const imageRatio = naturalWidth / naturalHeight;
    const targetRatio = targetWidth / targetHeight;
    if (imageRatio > targetRatio) {
      const sw = naturalHeight * targetRatio;
      return { sx: (naturalWidth - sw) / 2, sy: 0, sw, sh: naturalHeight };
    }
    const sh = naturalWidth / targetRatio;
    return { sx: 0, sy: (naturalHeight - sh) / 2, sw: naturalWidth, sh };
  }
}
