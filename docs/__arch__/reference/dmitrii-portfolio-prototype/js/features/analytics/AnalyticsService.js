import { whenPageIdle } from "../../core/whenPageIdle.js";

/**
 * Facade the features talk to: `analytics.track("cv_download")`.
 * Off by default (NullProvider); the provider script is loaded only after
 * the page is idle, so it never slows down the first render.
 * Also reports clicks on any element with data-track="event_name".
 */
export class AnalyticsService {
  #provider;

  /** @param {import("./providers/AnalyticsProvider.js").AnalyticsProvider} provider */
  constructor(provider) {
    this.#provider = provider;
  }

  /** @returns {() => void} disposer */
  start({ root = document } = {}) {
    whenPageIdle({ timeout: 3000 })
      .then(() => this.#provider.load())
      .catch((error) => console.warn("[analytics]", error.message));

    const controller = new AbortController();
    root.addEventListener(
      "click",
      (event) => {
        const target = /** @type {Element} */ (event.target).closest?.("[data-track]");
        if (target) this.track(target.getAttribute("data-track"), { lang: document.documentElement.lang });
      },
      { signal: controller.signal, capture: true },
    );
    return () => controller.abort();
  }

  /** @param {string} event  @param {Record<string, string | number | boolean>} [props] */
  track(event, props) {
    if (event) this.#provider.track(event, props);
  }
}
