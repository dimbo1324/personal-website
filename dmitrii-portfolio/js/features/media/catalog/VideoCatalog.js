import { DirectoryListingSource } from "./DirectoryListingSource.js";
import { ManifestSource } from "./ManifestSource.js";
import { VideoClip } from "./VideoClip.js";
import { humanizeFileName } from "./humanizeFileName.js";
import { groupClipFiles } from "./clipFiles.js";

/**
 * Discovers the hero clips.
 *   1. playlist.json — always present (the build and `npm run dev` keep it in
 *      sync with the folder); works on every host and carries the titles;
 *   2. directory listing — only if the playlist is missing (a plain dev server
 *      such as Live Server on a folder without it). Never asked otherwise, so
 *      static hosts never log a 404 for the folder URL.
 * Posters (NAME.webp) and phone versions (NAME.mobile.mp4) are matched by name.
 * Never throws.
 */
export class VideoCatalog {
  #config;
  #listing;
  #manifest;

  /** @param {typeof import("../../../data/heroVideos.js").HERO_VIDEOS} config */
  constructor(config) {
    this.#config = config;
    this.#listing = new DirectoryListingSource(config);
    this.#manifest = new ManifestSource(config);
  }

  /** @returns {Promise<VideoClip[]>} */
  async load() {
    const manifest = await this.#manifest.load();
    const meta = new Map((manifest ?? []).map((entry) => [entry.file, entry]));

    const files = manifest
      ? manifest.flatMap((entry) => [entry.file, entry.mobile, entry.poster].filter((file) => typeof file === "string"))
      : ((await this.#listing.list()) ?? []);

    const directory = new URL(this.#config.directory, document.baseURI);
    const url = (file) => (file ? new URL(encodeURIComponent(file), directory).href : null);

    return groupClipFiles(files, this.#config).map((group) => {
      const entry = meta.get(group.main);
      return new VideoClip({
        file: group.main,
        src: url(group.main),
        mobileSrc: url(group.mobile),
        poster: url(group.poster),
        title: entry?.title || humanizeFileName(group.main),
        description: entry?.description || "",
        generated: Boolean(entry?.generated),
      });
    });
  }
}
