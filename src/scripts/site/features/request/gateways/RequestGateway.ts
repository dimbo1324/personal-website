import type { MessageVars } from "../../../i18n/types";
import type { RequestPayload } from "../RequestPayload";

export interface GatewayResult {
  readonly ok: boolean;
  readonly messageKey: string;
  readonly vars?: MessageVars;
}

/** Abstract delivery channel for a RequestPayload. */
export abstract class RequestGateway {
  protected constructor() {
    if (new.target === RequestGateway) throw new TypeError("RequestGateway is abstract");
  }

  /** "mailto" | "http" — lets the UI explain what pressing "Send" will do. */
  abstract get kind(): string;

  abstract send(payload: RequestPayload): Promise<GatewayResult>;
}
