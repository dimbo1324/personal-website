/**
 * The theater's ordered media list: every reel clip first, then every
 * gallery photo. Pure data, no DOM. Video thumbnails arrive later
 * (captured from the clips) through setThumb().
 */
export class TheaterPlaylist {
  #items;
  #index = 0;

  /**
   * @param {readonly import("../media/catalog/VideoClip.js").VideoClip[]} clips
   * @param {readonly { src: string, title: string, description: string }[]} photos
   */
  constructor(clips, photos) {
    this.#items = [
      ...clips.map((clip) => ({ type: "video", src: clip.src, thumb: null, title: clip.title, description: clip.description })),
      ...photos.map((photo) => ({ type: "image", src: photo.src, thumb: photo.src, title: photo.title, description: photo.description })),
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
