import type { RequestPayload } from "../RequestPayload";
import { RequestGateway } from "./RequestGateway";
import type { GatewayResult } from "./RequestGateway";

/**
 * Demo delivery: acknowledges the payload without a network call and without
 * persisting it. Selected only by an explicit `PUBLIC_LEAD_MODE=demo` build.
 */
export class DemoGateway extends RequestGateway {
  constructor() {
    super();
  }

  override get kind(): string {
    return "demo";
  }

  override send(_payload: RequestPayload): Promise<GatewayResult> {
    return Promise.resolve({ ok: true, messageKey: "form.result.demo" });
  }
}
