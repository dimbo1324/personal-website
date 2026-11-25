export interface LeadEnv {
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly TELEGRAM_BOT_TOKEN?: string;
  readonly TELEGRAM_CHAT_ID?: string;
  readonly ALLOWED_ORIGIN?: string;
  /** "telegram" (default) or "stub" for a local demo without a bot. */
  readonly LEAD_DELIVERY_MODE?: string;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type TurnstileResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: string };
