/**
 * Samples an <img> into a cols×rows colour grid using the same crop as
 * CSS `object-fit: cover`, so dots line up with the photo underneath.
 * Falls back to a brand palette when pixels are unreadable (CORS-tainted).
 */
export class ImageSampler {
  static FALLBACK_PALETTE = Object.freeze([
    [36, 184, 155],
    [52, 214, 182],
    [107, 136, 150],
    [184, 214, 222],
    [242, 153, 74],
  ]);

  #cache = new Map();

  clear() {
    this.#cache.clear();
  }

  /**
   * @param {HTMLImageElement} image
   * @param {number} index  cache key
   * @param {{ width: number, height: number, cols: number, rows: number }} grid
   * @returns {{ r: number, g: number, b: number, lum: number }[]}
   */
  sample(image, index, { width, height, cols, rows }) {
    const key = `${index}:${cols}x${rows}:${width}x${height}`;
    if (this.#cache.has(key)) return this.#cache.get(key);

    const cells = this.#readPixels(image, { width, height, cols, rows }) ?? this.#fallback(index, cols, rows);
    this.#cache.set(key, cells);
    return cells;
  }

  #readPixels(image, { width, height, cols, rows }) {
    if (!image?.complete || !image.naturalWidth) return null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = cols;
      canvas.height = rows;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const crop = ImageSampler.coverCrop(image.naturalWidth, image.naturalHeight, width, height);
      context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, cols, rows);
      const data = context.getImageData(0, 0, cols, rows).data;

      const cells = [];
      for (let i = 0; i < cols * rows; i += 1) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        cells.push({
          r: Math.min(255, Math.round(r * 0.86 + 30)),
          g: Math.min(255, Math.round(g * 0.92 + 36)),
          b: Math.min(255, Math.round(b * 0.9 + 34)),
          lum: (0.299 * r + 0.587 * g + 0.114 * b) / 255,
        });
      }
      return cells;
    } catch {
      return null; // tainted canvas
    }
  }

  #fallback(index, cols, rows) {
    const palette = ImageSampler.FALLBACK_PALETTE;
    const cells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const wave = Math.sin(col * 0.22 + index * 2) * Math.cos(row * 0.27 + index);
        const [r, g, b] = palette[Math.abs(Math.floor((wave + 1) * 1.6 + (col + row) * 0.05)) % palette.length];
        cells.push({ r, g, b, lum: 0.3 + 0.35 * Math.abs(wave) });
      }
    }
    return cells;
  }

  /** Source rectangle that reproduces object-fit: cover. */
  static coverCrop(naturalWidth, naturalHeight, targetWidth, targetHeight) {
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
