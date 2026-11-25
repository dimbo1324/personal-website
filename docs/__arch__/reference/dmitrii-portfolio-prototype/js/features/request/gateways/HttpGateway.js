import { RequestGateway } from "./RequestGateway.js";
import { HTTP_PROVIDERS } from "./providers/index.js";

/**
 * POSTs the request as JSON to a form back-end (Web3Forms, Formspree or
 * your own API). Remember to allow the endpoint's origin in the CSP
 * connect-src — the build does it automatically (see build/csp.js).
 */
export class HttpGateway extends RequestGateway {
  static TIMEOUT_MS = 12000;

  #endpoint;
  #provider;
  #options;
  #fetch;

  /**
   * @param {{ provider?: keyof typeof HTTP_PROVIDERS, endpoint?: string | null, accessKey?: string | null,
   *           subjectPrefix: string,
   *           fetchImpl?: (url: string, init: RequestInit) => Promise<{ ok: boolean, status: number }> }} options
   */
  constructor({ provider = "custom", endpoint = null, accessKey = null, subjectPrefix, fetchImpl }) {
    super();
    this.#provider = HTTP_PROVIDERS[provider] ?? HTTP_PROVIDERS.custom;
    this.#endpoint = endpoint || this.#provider.endpoint;
    if (!this.#endpoint) throw new Error("HttpGateway requires an endpoint");
    this.#options = { accessKey, subjectPrefix };
    this.#fetch = fetchImpl ?? ((input, init) => window.fetch(input, init));
  }

  get kind() {
    return "http";
  }

  async send(payload) {
    try {
      const response = await this.#fetch(this.#endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(this.#provider.body(payload, this.#options)),
        signal: AbortSignal.timeout(HttpGateway.TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { ok: true, messageKey: "form.result.delivered" };
    } catch {
      return { ok: false, messageKey: "form.result.failed" };
    }
  }
}
