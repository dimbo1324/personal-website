import { RequestGateway } from "./RequestGateway.js";

/**
 * Hands the request to the visitor's mail client via a mailto: link.
 * Needs no backend, so it works on any static host (GitHub Pages, Netlify…).
 */
export class MailtoGateway extends RequestGateway {
  #recipient;
  #subjectPrefix;
  #navigate;

  /**
   * @param {{ recipient: string, subjectPrefix: string, navigate?: (url: string) => void }} options
   */
  constructor({ recipient, subjectPrefix, navigate = (url) => window.location.assign(url) }) {
    super();
    this.#recipient = recipient;
    this.#subjectPrefix = subjectPrefix;
    this.#navigate = navigate;
  }

  get kind() {
    return "mailto";
  }

  /** @param {import("../RequestPayload.js").RequestPayload} payload */
  buildUrl(payload) {
    const subject = encodeURIComponent(payload.subject(this.#subjectPrefix));
    const body = encodeURIComponent(payload.toPlainText());
    return `mailto:${this.#recipient}?subject=${subject}&body=${body}`;
  }

  async send(payload) {
    this.#navigate(this.buildUrl(payload));
    return { ok: true, messageKey: "form.result.mailto", vars: { recipient: this.#recipient } };
  }
}
