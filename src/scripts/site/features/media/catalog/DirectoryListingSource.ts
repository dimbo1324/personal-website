interface DirectoryConfig {
  readonly directory: string;
  readonly extensions: readonly string[];
  readonly posterExtensions: readonly string[];
}

/** Reads the HTML directory listing that local dev servers produce. */
export class DirectoryListingSource {
  readonly #directory: URL;
  readonly #extensions: string[];

  constructor({ directory, extensions, posterExtensions }: DirectoryConfig) {
    this.#directory = new URL(directory, document.baseURI);
    this.#extensions = [...extensions, ...posterExtensions].map((ext) => ext.toLowerCase());
  }

  async list(): Promise<string[] | null> {
    try {
      const response = await fetch(this.#directory, {
        headers: { Accept: "text/html" },
        cache: "no-store",
      });
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.includes("text/html")) return null;

      const document = new DOMParser().parseFromString(await response.text(), "text/html");
      const files = new Set<string>();
      document.querySelectorAll("a[href]").forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href) return;
        const url = new URL(href, this.#directory);
        if (url.origin !== this.#directory.origin) return;
        if (!url.pathname.startsWith(this.#directory.pathname)) return;
        const name = decodeURIComponent(url.pathname.slice(this.#directory.pathname.length));
        if (!name || name.includes("/")) return;
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        if (this.#extensions.includes(ext)) files.add(name);
      });
      return files.size > 0 ? [...files] : null;
    } catch {
      return null;
    }
  }
}
