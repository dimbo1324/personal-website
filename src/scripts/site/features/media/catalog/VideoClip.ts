import type { LocalizedText } from "../../../i18n/types";
import { localize } from "../../../i18n/types";

export interface VideoClipData {
  readonly file: string;
  readonly src: string;
  readonly mobileSrc?: string | null;
  readonly poster?: string | null;
  readonly title: string | LocalizedText;
  readonly description?: string | LocalizedText;
  readonly generated?: boolean;
}

/** Immutable description of one reel clip. */
export class VideoClip {
  readonly file: string;
  readonly src: string;
  readonly mobileSrc: string | null;
  readonly poster: string | null;
  readonly titles: string | LocalizedText;
  readonly descriptions: string | LocalizedText;
  readonly generated: boolean;

  constructor({
    file,
    src,
    mobileSrc = null,
    poster = null,
    title,
    description = "",
    generated = false,
  }: VideoClipData) {
    this.file = file;
    this.src = src;
    this.mobileSrc = mobileSrc;
    this.poster = poster;
    this.titles = title;
    this.descriptions = description;
    this.generated = generated;
    Object.freeze(this);
  }

  title(lang = "en"): string {
    return localize(this.titles, lang === "en" || lang === "es" || lang === "ru" ? lang : "en");
  }

  description(lang = "en"): string {
    return localize(
      this.descriptions,
      lang === "en" || lang === "es" || lang === "ru" ? lang : "en",
    );
  }

  sourceFor({ compact = false }: { readonly compact?: boolean } = {}): string {
    return compact && this.mobileSrc ? this.mobileSrc : this.src;
  }
}
