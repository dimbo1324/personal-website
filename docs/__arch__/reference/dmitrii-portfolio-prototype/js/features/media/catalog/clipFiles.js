/**
 * File-name conventions inside the reel folder:
 *   02-keynote.mp4          main clip
 *   02-keynote.mobile.mp4   optional lighter version for phones
 *   02-keynote.webp         optional poster (first frame)
 */
const MOBILE_SUFFIX = ".mobile";

const extOf = (file) => file.split(".").pop().toLowerCase();

/** "02-keynote.mobile.mp4" → "02-keynote" */
export function baseName(file) {
  const withoutExt = file.slice(0, file.length - extOf(file).length - 1);
  return withoutExt.endsWith(MOBILE_SUFFIX) ? withoutExt.slice(0, -MOBILE_SUFFIX.length) : withoutExt;
}

export const isMobileVariant = (file) => file.slice(0, file.lastIndexOf(".")).endsWith(MOBILE_SUFFIX);

/**
 * Groups a flat file list into clips.
 * @param {string[]} files
 * @param {{ extensions: readonly string[], posterExtensions: readonly string[] }} config
 * @returns {{ base: string, main: string, mobile: string|null, poster: string|null }[]}
 */
export function groupClipFiles(files, { extensions, posterExtensions }) {
  const groups = new Map();
  const group = (base) => {
    if (!groups.has(base)) groups.set(base, { base, main: null, mobile: null, poster: null });
    return groups.get(base);
  };

  files.forEach((file) => {
    const ext = extOf(file);
    const entry = group(baseName(file));
    if (posterExtensions.includes(ext)) {
      entry.poster ??= file;
    } else if (extensions.includes(ext)) {
      if (isMobileVariant(file)) entry.mobile ??= file;
      else if (!entry.main || ext === "mp4") entry.main = file; // mp4 wins: universally supported
    }
  });

  return [...groups.values()].filter((entry) => entry.main).sort((a, b) => a.base.localeCompare(b.base, "en", { numeric: true }));
}
