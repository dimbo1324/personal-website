import type { LeadSubmission } from "../../src/lib/lead";
import { TelegramNotifier } from "./telegram";
import type { FetchLike, LeadEnv } from "./types";

export type LeadDeliveryMode = "telegram" | "stub";

export interface LeadDeliveryInput {
  readonly botToken: string;
  readonly chatId: string;
  readonly lead: LeadSubmission;
  readonly receivedAtIso: string;
}

export type LeadDeliveryResult =
  | { readonly ok: true; readonly mode: LeadDeliveryMode }
  | { readonly ok: false; readonly reason: string };

/** Delivery port: the handler depends on it, not on the Telegram API. */
export interface LeadNotifier {
  readonly mode: LeadDeliveryMode;
  sendLead(input: LeadDeliveryInput): Promise<LeadDeliveryResult>;
}

/**
 * Local demo notifier. It performs no network call and keeps only a counter,
 * never the visitor's data; the handler reports `delivery: "stub"` so the
 * caller can tell a demo run from a real Telegram delivery.
 */
export class StubLeadNotifier implements LeadNotifier {
  readonly mode = "stub";
  #received = 0;

  get received(): number {
    return this.#received;
  }

  async sendLead(_input: LeadDeliveryInput): Promise<LeadDeliveryResult> {
    this.#received += 1;
    return { ok: true, mode: "stub" };
  }
}

/**
 * Selects the notifier from the environment. The stub exists only behind an
 * explicit `LEAD_DELIVERY_MODE=stub`; every other value (including a typo)
 * keeps the real Telegram path, which fails closed without credentials.
 */
export function createLeadNotifier(env: LeadEnv, fetchImpl: FetchLike = fetch): LeadNotifier {
  if (env.LEAD_DELIVERY_MODE?.trim() === "stub") {
    return new StubLeadNotifier();
  }
  return new TelegramNotifier(fetchImpl);
}
