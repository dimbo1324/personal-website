/**
 * Whether lighter media should be used: small screens (the given media
 * query) or a visitor who asked the browser to save data.
 *
 * @param {string} compactQuery  e.g. "(max-width: 820px)"
 */
export function prefersCompactMedia(compactQuery) {
  const saveData = Boolean(/** @type {any} */ (navigator).connection?.saveData);
  const small = typeof window.matchMedia === "function" && window.matchMedia(compactQuery).matches;
  return saveData || small;
}
