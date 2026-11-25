/**
 * Rewrites Unsplash URLs in HTML to the local copies made by
 * `npm run images:fetch` (assets/images/remote/manifest.json).
 * URLs without a downloaded copy are left untouched.
 */
const UNSPLASH = /https:\/\/images\.unsplash\.com\/(photo-[\w-]+)\?[^"'\s,]*?w=(\d+)[^"'\s,]*/g;

/**
 * @param {string} html
 * @param {{ files: Record<string, string> }} manifest  "photoId@width" → local path
 */
export function rewriteRemoteImages(html, manifest) {
  return html.replace(UNSPLASH, (match, photoId, width) => manifest.files[`${photoId}@${width}`] ?? match);
}

/** Whether any Unsplash URL is still referenced (decides the CSP img-src). */
export const referencesUnsplash = (text) => /https:\/\/images\.unsplash\.com\//.test(text);
