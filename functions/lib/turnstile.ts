import type { FetchLike, TurnstileResult } from "./types";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyPayload {
  readonly success?: boolean;
  readonly "error-codes"?: readonly string[];
}

export class TurnstileVerifier {
  readonly #fetch: FetchLike;

  constructor(fetchImpl: FetchLike = fetch) {
    this.#fetch = fetchImpl;
  }

  async verify(input: {
    readonly secretKey: string;
    readonly token: string;
    readonly remoteIp: string | null;
  }): Promise<TurnstileResult> {
    if (input.secretKey.trim().length === 0) {
      return { ok: false, reason: "turnstile_not_configured" };
    }

    const body = new URLSearchParams();
    body.set("secret", input.secretKey);
    body.set("response", input.token);

    if (input.remoteIp) {
      body.set("remoteip", input.remoteIp);
    }

    try {
      const response = await this.#fetch(SITEVERIFY_URL, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        return { ok: false, reason: "turnstile_upstream_error" };
      }

      const payload = (await response.json()) as SiteverifyPayload;

      if (payload.success !== true) {
        return { ok: false, reason: "turnstile_rejected" };
      }

      return { ok: true };
    } catch {
      return { ok: false, reason: "turnstile_network_error" };
    }
  }
}
