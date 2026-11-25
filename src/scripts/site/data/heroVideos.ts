import type { LocalizedText } from "../i18n/types";

export interface HeroVideoConfig {
  readonly directory: string;
  readonly manifest: string;
  readonly extensions: readonly string[];
  readonly posterExtensions: readonly string[];
  readonly compactQuery: string;
  readonly fallback: {
    readonly image: string;
    readonly title: LocalizedText;
  };
}

/**
 * Hero video reel configuration.
 *
 * Drop clips into `directory` — they are picked up automatically, sorted by
 * name (prefix them 01-, 02-, …). Optional companions, matched by name:
 *   NAME.mobile.mp4  lighter version used on phones / data-saver
 *   NAME.webp        poster shown before the clip starts
 * Titles come from playlist.json (localisable), otherwise from the file name.
 * Empty folder → the frame shows `fallback` instead.
 */
export const HERO_VIDEOS: HeroVideoConfig = Object.freeze({
  directory: "assets/video/hero/",
  manifest: "assets/video/hero/playlist.json",
  extensions: Object.freeze(["mp4", "webm", "m4v", "mov"]),
  posterExtensions: Object.freeze(["webp", "jpg", "jpeg", "png"]),
  /** below this width (or with data-saver on) the .mobile variant is used */
  compactQuery: "(max-width: 820px)",
  fallback: Object.freeze({
    image: "assets/images/keynote.webp",
    title: Object.freeze({
      en: "Field & stage highlights",
      es: "Momentos en planta y escenario",
      ru: "Объекты и выступления",
    }),
  }),
});
