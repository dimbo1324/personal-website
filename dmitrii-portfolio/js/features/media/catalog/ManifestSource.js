/**
 * Reads playlist.json: { "videos": [{ "file", "title", "description" }] }.
 * Used for metadata everywhere and as the file list on static hosts.
 */
export class ManifestSource {
  #url;

  /** @param {{ manifest: string }} options */
  constructor({ manifest }) {
    this.#url = new URL(manifest, document.baseURI);
  }

  /** @returns {Promise<{ file: string, title?: string, description?: string }[]|null>} */
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
