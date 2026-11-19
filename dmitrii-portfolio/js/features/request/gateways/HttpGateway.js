import { RequestGateway } from "./RequestGateway.js";

/**
 * POSTs the request as JSON to an endpoint (own API, Formspree, etc.).
 * Ready for when the site gets a backend — switch `transport` in data/request.js.
 */
export class HttpGateway extends RequestGateway {
  static TIMEOUT_MS = 10000;

  #endpoint;

  /** @param {{ endpoint: string }} options */
  constructor({ endpoint }) {
    super();
    if (!endpoint) throw new Error("HttpGateway requires an endpoint");
    this.#endpoint = endpoint;
  }

  async send(payload) {
    try {
      const response = await fetch(this.#endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(HttpGateway.TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { ok: true, message: "Thank you! Your request has been delivered — I will reply within one business day." };
    } catch {
      return { ok: false, message: "The request could not be sent. Please try again or use the email link above." };
    }
  }
}
