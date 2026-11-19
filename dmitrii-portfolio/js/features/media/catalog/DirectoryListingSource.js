/**
 * Reads the HTML directory listing that local dev servers produce
 * (VS Code Live Server, `npx serve`, `python -m http.server`) and returns
 * the video file names inside the folder. Parsed with DOMParser — the
 * listing is never executed or inserted into the page.
 */
export class DirectoryListingSource {
  #directory;
  #extensions;

  /** @param {{ directory: string, extensions: readonly string[] }} options */
  constructor({ directory, extensions }) {
    this.#directory = new URL(directory, document.baseURI);
    this.#extensions = extensions.map((ext) => ext.toLowerCase());
  }

  /** @returns {Promise<string[]|null>} file names, or null if no listing is available */
  async list() {
    try {
      const response = await fetch(this.#directory, { headers: { Accept: "text/html" }, cache: "no-store" });
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.includes("text/html")) return null;

      const doc = new DOMParser().parseFromString(await response.text(), "text/html");
      const files = new Set();
      doc.querySelectorAll("a[href]").forEach((anchor) => {
        const url = new URL(anchor.getAttribute("href"), this.#directory);
        if (url.origin !== this.#directory.origin) return;
        if (!url.pathname.startsWith(this.#directory.pathname)) return;
        const name = decodeURIComponent(url.pathname.slice(this.#directory.pathname.length));
        if (!name || name.includes("/")) return; // only direct children
        const ext = name.split(".").pop().toLowerCase();
        if (this.#extensions.includes(ext)) files.add(name);
      });
      return [...files];
    } catch {
      return null;
    }
  }
}
