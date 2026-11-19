/**
 * Abstract delivery channel for a RequestPayload.
 * Subclasses implement `send()` and describe the outcome for the UI.
 */
export class RequestGateway {
  constructor() {
    if (new.target === RequestGateway) throw new TypeError("RequestGateway is abstract");
  }

  /**
   * @param {import("../RequestPayload.js").RequestPayload} payload
   * @returns {Promise<{ ok: boolean, message: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async send(payload) {
    throw new Error(`${this.constructor.name} must implement send()`);
  }
}
