import { LeadValidator } from "../../src/lib/lead";
import { TelegramNotifier } from "./telegram";
import { TurnstileVerifier } from "./turnstile";
import type { FetchLike, LeadEnv } from "./types";

const MAX_BODY_BYTES = 16_384;

export interface LeadHandlerDependencies {
  readonly validator?: LeadValidator;
  readonly turnstile?: TurnstileVerifier;
  readonly telegram?: TelegramNotifier;
  readonly now?: () => Date;
}

export class LeadApiHandler {
  readonly #validator: LeadValidator;
  readonly #turnstile: TurnstileVerifier;
  readonly #telegram: TelegramNotifier;
  readonly #now: () => Date;

  constructor(deps: LeadHandlerDependencies = {}, fetchImpl: FetchLike = fetch) {
    this.#validator = deps.validator ?? new LeadValidator();
    this.#turnstile = deps.turnstile ?? new TurnstileVerifier(fetchImpl);
    this.#telegram = deps.telegram ?? new TelegramNotifier(fetchImpl);
    this.#now = deps.now ?? (() => new Date());
  }

  async handle(request: Request, env: LeadEnv): Promise<Response> {
    if (!this.#isOriginAllowed(request, env.ALLOWED_ORIGIN)) {
      return this.#json(403, { ok: false, error: "origin_not_allowed" });
    }

    const parsedBody = await this.#readJson(request);

    if (!parsedBody.ok) {
      return this.#json(parsedBody.status, { ok: false, error: parsedBody.error });
    }

    const validation = this.#validator.validate(parsedBody.data);

    if (!validation.ok) {
      return this.#json(400, { ok: false, error: validation.code });
    }

    const turnstile = await this.#turnstile.verify({
      secretKey: env.TURNSTILE_SECRET_KEY ?? "",
      token: validation.data.turnstileToken,
      remoteIp: request.headers.get("CF-Connecting-IP"),
    });

    if (!turnstile.ok) {
      const status = turnstile.reason === "turnstile_not_configured" ? 503 : 403;
      return this.#json(status, { ok: false, error: turnstile.reason });
    }

    const delivery = await this.#telegram.sendLead({
      botToken: env.TELEGRAM_BOT_TOKEN ?? "",
      chatId: env.TELEGRAM_CHAT_ID ?? "",
      lead: validation.data,
      receivedAtIso: this.#now().toISOString(),
    });

    if (!delivery.ok) {
      const status = delivery.reason === "telegram_not_configured" ? 503 : 502;
      return this.#json(status, { ok: false, error: delivery.reason });
    }

    return this.#json(200, { ok: true });
  }

  #isOriginAllowed(request: Request, allowedOrigin: string | undefined): boolean {
    const trimmedAllowed = allowedOrigin?.trim() ?? "";

    if (trimmedAllowed.length === 0) {
      return true;
    }

    const origin = request.headers.get("Origin");

    return origin === trimmedAllowed;
  }

  async #readJson(
    request: Request,
  ): Promise<
    | { readonly ok: true; readonly data: unknown }
    | { readonly ok: false; readonly status: number; readonly error: string }
  > {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return { ok: false, status: 415, error: "unsupported_media_type" };
    }

    const rawText = await request.text();

    if (rawText.length > MAX_BODY_BYTES) {
      return { ok: false, status: 413, error: "payload_too_large" };
    }

    try {
      return { ok: true, data: JSON.parse(rawText) as unknown };
    } catch {
      return { ok: false, status: 400, error: "malformed_json" };
    }
  }

  #json(status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
}
