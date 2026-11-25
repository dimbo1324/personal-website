import { AnalyticsProvider } from "./AnalyticsProvider.js";
import { loadScript } from "../loadScript.js";

/**
 * Plausible (https://plausible.io) — cookieless, no personal data.
 * Events fired before the script arrives are queued in window.plausible.q,
 * which the script replays (the documented stub, set up without inline JS).
 */
export class PlausibleProvider extends AnalyticsProvider {
  static DEFAULT_SRC = "https://plausible.io/js/script.js";

  #domain;
  #src;

  /** @param {{ domain: string, src?: string | null }} options */
  constructor({ domain, src }) {
    super();
    if (!domain) throw new Error("Plausible needs VITE_ANALYTICS_DOMAIN");
    this.#domain = domain;
    this.#src = src ?? PlausibleProvider.DEFAULT_SRC;
  }

  async load() {
    const w = /** @type {any} */ (window);
    w.plausible =
      w.plausible ||
      function plausibleQueue(...args) {
        (w.plausible.q = w.plausible.q || []).push(args);
      };
    await loadScript(this.#src, { domain: this.#domain });
  }

  track(event, props) {
    try {
      /** @type {any} */ (window).plausible?.(event, props ? { props } : undefined);
    } catch {
      /* analytics must never break the page */
    }
  }
}
