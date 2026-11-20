/**
 * The theater's ordered media list: every reel clip first, then every
 * gallery photo. Pure data, no DOM. Titles/descriptions stay localizable
 * values ({ en, es, ru } or strings); the view picks the language.
 * Clip thumbnails are their posters; missing ones arrive later through setThumb().
 *
 * @typedef {{ type: "video" | "image", src: string, poster: string | null, thumb: string | null,
 *             title: any, description: any,
 *             generated: boolean }} TheaterItem
 */
export class TheaterPlaylist {
  /** @type {TheaterItem[]} */
  #items;
  #index = 0;

  /**
   * @param {readonly import("../media/catalog/VideoClip.js").VideoClip[]} clips
   * @param {readonly { image: { src: string }, title: unknown, description: unknown }[]} photos
   * @param {{ compact?: boolean }} [options]  compact: prefer the lighter mobile files
   */
  constructor(clips, photos, { compact = false } = {}) {
    this.#items = [
      ...clips.map((clip) => ({
        type: /** @type {const} */ ("video"),
        src: clip.sourceFor({ compact }),
        poster: clip.poster,
        thumb: clip.poster,
        title: clip.titles,
        description: clip.descriptions,
        generated: clip.generated,
      })),
      ...photos.map((photo) => ({
        type: /** @type {const} */ ("image"),
        src: photo.image.src,
        poster: null,
        thumb: photo.image.src,
        title: photo.title,
        description: photo.description,
        generated: false,
      })),
    ];
  }

  get items() {
    return this.#items;
  }

  get length() {
    return this.#items.length;
  }

  get index() {
    return this.#index;
  }

  get current() {
    return this.#items[this.#index];
  }

  /** Index of the next video after the current item (wraps), or -1 if none. */
  get nextVideoIndex() {
    for (let step = 1; step <= this.length; step += 1) {
      const index = (this.#index + step) % this.length;
      if (this.#items[index].type === "video") return index;
    }
    return -1;
  }

  setThumb(index, url) {
    if (this.#items[index]) this.#items[index].thumb = url;
  }

  select(index) {
    this.#index = (index + this.length) % this.length;
    return this.current;
  }
}
