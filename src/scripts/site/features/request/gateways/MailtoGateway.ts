import type { MessageVars } from "../../../i18n/types";
import type { RequestPayload } from "../RequestPayload";
import { RequestGateway } from "./RequestGateway";
import type { GatewayResult } from "./RequestGateway";

interface MailtoOptions {
  readonly recipient: string;
  readonly subjectPrefix: string;
  readonly navigate?: (url: string) => void;
}

/** Hands the request to the visitor's mail client via a mailto: link. */
export class MailtoGateway extends RequestGateway {
  readonly #recipient: string;
  readonly #subjectPrefix: string;
  readonly #navigate: (url: string) => void;

  constructor({
    recipient,
    subjectPrefix,
    navigate = (url) => window.location.assign(url),
  }: MailtoOptions) {
    super();
    this.#recipient = recipient;
    this.#subjectPrefix = subjectPrefix;
    this.#navigate = navigate;
  }

  override get kind(): string {
    return "mailto";
  }

  buildUrl(payload: RequestPayload): string {
    const subject = encodeURIComponent(payload.subject(this.#subjectPrefix));
    const body = encodeURIComponent(payload.toPlainText());
    return `mailto:${this.#recipient}?subject=${subject}&body=${body}`;
  }

  override async send(payload: RequestPayload): Promise<GatewayResult> {
    this.#navigate(this.buildUrl(payload));
    const vars: MessageVars = { recipient: this.#recipient };
    return { ok: true, messageKey: "form.result.mailto", vars };
  }
}
