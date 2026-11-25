import { LOCAL_IMAGES } from "../../../data/generated/localImages.js";
import { REMOTE_IMAGES, REMOTE_WIDTHS } from "../../../data/remoteImages.js";

/**
 * Responsive image descriptors: { src, srcset, remote }.
 * `src` is the largest file; `srcset` lets the browser pick a smaller one.
 */

const IMAGES_DIR = "assets/images";

/**
 * Own photo with pre-rendered smaller copies (name-<w>.webp next to name.webp).
 * @param {string} name  file name without extension
 * @param {{ full: number, widths?: number[] }} sizes  full = width of the original
 */
export function localImage(name, { full, widths = [] }) {
  const src = `${IMAGES_DIR}/${name}.webp`;
  const srcset = [...widths.map((w) => `${IMAGES_DIR}/${name}-${w}.webp ${w}w`), `${src} ${full}w`].join(", ");
  return Object.freeze({ src, srcset, remote: false });
}

/** Unsplash URL for a photo id at a given width (WebP via the CDN's auto=format). */
export function unsplashUrl(photoId, width) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=75`;
}

/**
 * Third-party image: local copy if `npm run images:fetch` downloaded it,
 * otherwise the CDN with the same widths.
 * @param {keyof typeof REMOTE_IMAGES} id
 */
export function remoteImage(id, { local = LOCAL_IMAGES, widths = REMOTE_WIDTHS } = {}) {
  const photoId = REMOTE_IMAGES[id];
  if (!photoId) throw new Error(`Unknown remote image "${id}"`);
  const largest = widths[widths.length - 1];
  if (local.includes(id)) {
    const path = (w) => `${IMAGES_DIR}/remote/${id}-${w}.webp`;
    return Object.freeze({ src: path(largest), srcset: widths.map((w) => `${path(w)} ${w}w`).join(", "), remote: false });
  }
  return Object.freeze({
    src: unsplashUrl(photoId, largest),
    srcset: widths.map((w) => `${unsplashUrl(photoId, w)} ${w}w`).join(", "),
    remote: true,
  });
}
