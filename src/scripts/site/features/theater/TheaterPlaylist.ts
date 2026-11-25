import type { LocalizedText } from "../../i18n/types";
import type { VideoClip } from "../media/catalog/VideoClip";

export type TheaterItemType = "video" | "image";

export interface TheaterItem {
  readonly type: TheaterItemType;
  readonly src: string;
  readonly poster: string | null;
  thumb: string | null;
  readonly title: string | LocalizedText;
  readonly description: string | LocalizedText;
  readonly generated: boolean;
}

interface TheaterPhoto {
  readonly image: { readonly src: string };
  readonly title: string | LocalizedText;
  readonly description: string | LocalizedText;
}

/** The theater's ordered media list: every reel clip first, then every photo. */
export class TheaterPlaylist {
  readonly #items: TheaterItem[];
  #index = 0;

  constructor(
    clips: readonly VideoClip[],
    photos: readonly TheaterPhoto[],
    { compact = false }: { readonly compact?: boolean } = {},
  ) {
    this.#items = [
      ...clips.map((clip): TheaterItem => ({
        type: "video",
        src: clip.sourceFor({ compact }),
        poster: clip.poster,
        thumb: clip.poster,
        title: clip.titles,
        description: clip.descriptions,
        generated: clip.generated,
      })),
      ...photos.map((photo): TheaterItem => ({
        type: "image",
        src: photo.image.src,
        poster: null,
        thumb: photo.image.src,
        title: photo.title,
        description: photo.description,
        generated: false,
      })),
    ];
  }

  get items(): readonly TheaterItem[] {
    return this.#items;
  }

  get length(): number {
    return this.#items.length;
  }

  get index(): number {
    return this.#index;
  }

  get current(): TheaterItem | undefined {
    return this.#items[this.#index];
  }

  /** Index of the next video after the current item (wraps), or -1 if none. */
  get nextVideoIndex(): number {
    if (this.length === 0) return -1;
    for (let step = 1; step <= this.length; step += 1) {
      const index = (this.#index + step) % this.length;
      if (this.#items[index]?.type === "video") return index;
    }
    return -1;
  }

  setThumb(index: number, url: string): void {
    const item = this.#items[index];
    if (item) item.thumb = url;
  }

  select(index: number): TheaterItem | undefined {
    this.#index = (index + this.length) % this.length;
    return this.current;
  }
}
