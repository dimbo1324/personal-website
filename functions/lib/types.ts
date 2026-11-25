export interface LeadEnv {
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly TELEGRAM_BOT_TOKEN?: string;
  readonly TELEGRAM_CHAT_ID?: string;
  readonly ALLOWED_ORIGIN?: string;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type TurnstileResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: string };

export type TelegramDeliveryResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: string };
