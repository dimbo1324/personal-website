/**
 * Hero video reel configuration.
 *
 * Drop .mp4 files into `directory` — they are picked up automatically
 * (sorted by name, so prefix them 01-, 02-, …). Titles come from
 * playlist.json when present, otherwise from the file name.
 * If the folder is empty the frame shows `fallback` instead.
 */
export const HERO_VIDEOS = Object.freeze({
  directory: "assets/video/hero/",
  manifest: "assets/video/hero/playlist.json",
  extensions: Object.freeze(["mp4", "webm", "m4v", "mov"]),
  fallback: Object.freeze({
    image: "assets/images/keynote.webp",
    title: "Field & stage highlights",
    description: "Commissioning, keynotes and digital twins.",
  }),
});
