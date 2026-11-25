/**
 * Abstract delivery channel for a RequestPayload.
 * Subclasses implement `send()` and describe the outcome with a translation
 * key, so the UI can show it in the visitor's language.
 *
 * @typedef {{ ok: boolean, messageKey: string, vars?: Record<string, unknown> }} GatewayResult
 */
export class RequestGateway {
  constructor() {
    if (new.target === RequestGateway) throw new TypeError("RequestGateway is abstract");
  }

  /** "mailto" | "http" — lets the UI explain what pressing "Send" will do. @returns {string} */
  get kind() {
    throw new Error(`${this.constructor.name} must implement kind`);
  }

  /**
   * @param {import("../RequestPayload.js").RequestPayload} payload
   * @returns {Promise<GatewayResult>}
   */
  // eslint-disable-next-line no-unused-vars
  async send(payload) {
    throw new Error(`${this.constructor.name} must implement send()`);
  }
}
