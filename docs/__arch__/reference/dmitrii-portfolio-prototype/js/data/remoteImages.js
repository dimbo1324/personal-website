/**
 * Third-party (Unsplash) images: hardware only, never people.
 * `npm run images:fetch` downloads each one into assets/images/remote/<id>-<width>.webp;
 * until then they load from Unsplash (allowed in the CSP img-src).
 */
export const REMOTE_IMAGES = Object.freeze({
  "hero-plant": "photo-1518709268805-4e9042af9f23",
  "hero-pcb": "photo-1518770660439-4636190af475",
  "server-room": "photo-1558494949-ef010cbdcc31",
  "control-cabinet": "photo-1780034766312-73825064806c",
  "embedded-board": "photo-1518770660439-4636190af475",
  "panel-wiring": "photo-1753272691001-4d68806ac590",
});

/** Widths downloaded / requested for srcset. */
export const REMOTE_WIDTHS = Object.freeze([480, 960, 1600]);
