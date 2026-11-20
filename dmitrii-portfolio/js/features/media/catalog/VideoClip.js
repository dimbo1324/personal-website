import { localize } from "../../../i18n/localize.js";

/**
 * Immutable description of one reel clip.
 * `title` / `description` may be plain strings or { en, es, ru } objects.
 */
export class VideoClip {
  /**
   * @param {{ file: string, src: string, mobileSrc?: string|null, poster?: string|null,
   *           title: string|Record<string,string>, description?: string|Record<string,string>,
   *           generated?: boolean }} data
   */
  constructor({ file, src, mobileSrc = null, poster = null, title, description = "", generated = false }) {
    this.file = file;
    this.src = src;
    this.mobileSrc = mobileSrc;
    this.poster = poster;
    this.titles = title;
    this.descriptions = description;
    this.generated = generated;
    Object.freeze(this);
  }

  title(lang = "en") {
    return localize(this.titles, lang);
  }

  description(lang = "en") {
    return localize(this.descriptions, lang);
  }

  /** Lighter file for small screens / data-saver, when one exists. */
  sourceFor({ compact = false } = {}) {
    return compact && this.mobileSrc ? this.mobileSrc : this.src;
  }
}
