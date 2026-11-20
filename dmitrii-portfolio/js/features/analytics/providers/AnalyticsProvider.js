/**
 * Interface of an analytics back-end. `track` must never throw:
 * analytics is optional and must not break the page.
 */
export class AnalyticsProvider {
  /** @returns {Promise<void>} */
  async load() {}

  /**
   * @param {string} event  @param {Record<string, string | number | boolean>} [props]
   */
  // eslint-disable-next-line no-unused-vars
  track(event, props) {}
}
