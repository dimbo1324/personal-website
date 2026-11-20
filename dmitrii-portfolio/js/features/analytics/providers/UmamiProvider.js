import { AnalyticsProvider } from "./AnalyticsProvider.js";
import { loadScript } from "../loadScript.js";

/**
 * Umami (https://umami.is, cloud or self-hosted) — cookieless.
 * window.umami exists only after the script loads, so earlier events are
 * buffered here and flushed on load.
 */
export class UmamiProvider extends AnalyticsProvider {
  static DEFAULT_SRC = "https://cloud.umami.is/script.js";

  #websiteId;
  #src;
  #queue = [];
  #ready = false;

  /** @param {{ websiteId: string, src?: string | null }} options */
  constructor({ websiteId, src }) {
    super();
    if (!websiteId) throw new Error("Umami needs VITE_ANALYTICS_WEBSITE_ID");
    this.#websiteId = websiteId;
    this.#src = src ?? UmamiProvider.DEFAULT_SRC;
  }

  async load() {
    await loadScript(this.#src, { websiteId: this.#websiteId, respectDoNotTrack: "true" });
    this.#ready = true;
    this.#queue.splice(0).forEach(([event, props]) => this.track(event, props));
  }

  track(event, props) {
    if (!this.#ready) {
      this.#queue.push([event, props]);
      return;
    }
    try {
      /** @type {any} */ (window).umami?.track(event, props);
    } catch {
      /* analytics must never break the page */
    }
  }
}
