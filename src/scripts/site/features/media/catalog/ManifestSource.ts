import type { LocalizedText } from "../../../i18n/types";

export interface ManifestEntry {
  readonly file: string;
  readonly title?: string | LocalizedText;
  readonly description?: string | LocalizedText;
  readonly generated?: boolean;
  readonly poster?: string;
  readonly mobile?: string;
}

/** Reads playlist.json for reel metadata and the file list on static hosts. */
export class ManifestSource {
  readonly #url: URL;

  constructor({ manifest }: { readonly manifest: string }) {
    this.#url = new URL(manifest, document.baseURI);
  }

  async load(): Promise<ManifestEntry[] | null> {
    try {
      const response = await fetch(this.#url, { cache: "no-store" });
      if (!response.ok) return null;
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("videos" in data) || !Array.isArray(data.videos))
        return null;
      return data.videos.filter(
        (entry: unknown): entry is ManifestEntry =>
          entry !== null &&
          typeof entry === "object" &&
          "file" in entry &&
          typeof entry.file === "string" &&
          entry.file.length > 0,
      );
    } catch {
      return null;
    }
  }
}
