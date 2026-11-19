/** Immutable description of one reel clip. */
export class VideoClip {
  /**
   * @param {{ src: string, file: string, title: string, description?: string }} data
   */
  constructor({ src, file, title, description = "" }) {
    this.src = src;
    this.file = file;
    this.title = title;
    this.description = description;
    Object.freeze(this);
  }
}
