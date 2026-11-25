/**
 * Reads playlist.json:
 * { "videos": [{ "file", "title", "description", "generated", "poster", "mobile" }] }
 * Used for metadata everywhere and as the file list on static hosts.
 */
export class ManifestSource {
  #url;

  /** @param {{ manifest: string }} options */
  constructor({ manifest }) {
    this.#url = new URL(manifest, document.baseURI);
  }

  /** @returns {Promise<object[]|null>} */
  async load() {
    try {
      const response = await fetch(this.#url, { cache: "no-store" });
      if (!response.ok) return null;
      const data = await response.json();
      if (!Array.isArray(data?.videos)) return null;
      return data.videos.filter((entry) => typeof entry?.file === "string" && entry.file.length > 0);
    } catch {
      return null;
    }
  }
}
