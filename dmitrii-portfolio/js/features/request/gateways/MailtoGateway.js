import { RequestGateway } from "./RequestGateway.js";

/**
 * Hands the request to the visitor's mail client via a mailto: link.
 * Needs no backend, so it works on any static host (GitHub Pages, Netlify…).
 */
export class MailtoGateway extends RequestGateway {
  #recipient;
  #subjectPrefix;

  /** @param {{ recipient: string, subjectPrefix: string }} options */
  constructor({ recipient, subjectPrefix }) {
    super();
    this.#recipient = recipient;
    this.#subjectPrefix = subjectPrefix;
  }

  async send(payload) {
    const subject = encodeURIComponent(payload.subject(this.#subjectPrefix));
    const body = encodeURIComponent(payload.toPlainText());
    window.location.href = `mailto:${this.#recipient}?subject=${subject}&body=${body}`;
    return {
      ok: true,
      message: `Your email app should open with the request addressed to ${this.#recipient}. Just press “Send”. If nothing opened, copy the request and email it manually.`,
    };
  }
}
