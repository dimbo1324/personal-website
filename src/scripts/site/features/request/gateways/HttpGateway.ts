import type { RequestPayload } from "../RequestPayload";
import type { HttpProviderKey, ProviderOptions } from "./providers";
import { HTTP_PROVIDERS } from "./providers";
import { RequestGateway as RequestGatewayBase } from "./RequestGateway";
import type { GatewayResult } from "./RequestGateway";

interface HttpOptions {
  readonly provider?: HttpProviderKey;
  readonly endpoint?: string | null;
  readonly accessKey?: string | null;
  readonly subjectPrefix: string;
  readonly fetchImpl?: (
    url: string,
    init: RequestInit,
  ) => Promise<{ readonly ok: boolean; readonly status: number }>;
}

/** POSTs the request as JSON to a form back-end. */
export class HttpGateway extends RequestGatewayBase {
  static readonly TIMEOUT_MS = 12000;

  readonly #endpoint: string;
  readonly #provider: (typeof HTTP_PROVIDERS)[HttpProviderKey];
  readonly #options: ProviderOptions;
  readonly #fetch: (
    url: string,
    init: RequestInit,
  ) => Promise<{ readonly ok: boolean; readonly status: number }>;

  constructor({
    provider = "custom",
    endpoint = null,
    accessKey = null,
    subjectPrefix,
    fetchImpl,
  }: HttpOptions) {
    super();
    const selected = HTTP_PROVIDERS[provider] ?? HTTP_PROVIDERS.custom;
    this.#provider = selected;
    this.#endpoint = endpoint || selected.endpoint || "";
    if (!this.#endpoint) throw new Error("HttpGateway requires an endpoint");
    this.#options = { accessKey, subjectPrefix };
    this.#fetch = fetchImpl ?? ((input, init) => window.fetch(input, init));
  }

  override get kind(): string {
    return "http";
  }

  override async send(payload: RequestPayload): Promise<GatewayResult> {
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
