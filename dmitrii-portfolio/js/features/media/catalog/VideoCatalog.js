import { DirectoryListingSource } from "./DirectoryListingSource.js";
import { ManifestSource } from "./ManifestSource.js";
import { VideoClip } from "./VideoClip.js";
import { humanizeFileName } from "./humanizeFileName.js";

/**
 * Discovers the hero clips.
 *   1. directory listing (dev servers) — the folder itself is the truth,
 *      so dropping a new .mp4 in is enough;
 *   2. playlist.json — file list on static hosts + titles everywhere.
 * Clips are sorted by file name (01-, 02-, …). Never throws.
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
    const [listed, manifest] = await Promise.all([this.#listing.list(), this.#manifest.load()]);
    const meta = new Map((manifest ?? []).map((entry) => [entry.file, entry]));
    const files = listed ?? (manifest ?? []).map((entry) => entry.file);

    return this.#dedupe(files)
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
      .map((file) => {
        const entry = meta.get(file);
        return new VideoClip({
          file,
          src: new URL(encodeURIComponent(file), new URL(this.#config.directory, document.baseURI)).href,
          title: entry?.title || humanizeFileName(file),
          description: entry?.description || "",
        });
      });
  }

  /** "clip.mp4" + "clip.webm" → keep one (mp4 preferred: universally supported). */
  #dedupe(files) {
    const byBase = new Map();
    files.forEach((file) => {
      const base = file.replace(/\.[^.]+$/, "");
      const current = byBase.get(base);
      if (!current || file.toLowerCase().endsWith(".mp4")) byBase.set(base, file);
    });
    return [...byBase.values()];
  }
}
