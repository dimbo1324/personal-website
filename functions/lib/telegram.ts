import type { LeadDeliveryInput, LeadDeliveryResult, LeadNotifier } from "./notifier";
import type { FetchLike } from "./types";

interface TelegramApiResponse {
  readonly ok?: boolean;
}

export class TelegramNotifier implements LeadNotifier {
  readonly mode = "telegram";
  readonly #fetch: FetchLike;

  constructor(fetchImpl: FetchLike = fetch) {
    this.#fetch = fetchImpl;
  }

  async sendLead(input: LeadDeliveryInput): Promise<LeadDeliveryResult> {
    if (input.botToken.trim().length === 0 || input.chatId.trim().length === 0) {
      return { ok: false, reason: "telegram_not_configured" };
    }

    const endpoint = `https://api.telegram.org/bot${input.botToken}/sendMessage`;
    const text = [
      "New website request",
      `Time (UTC): ${input.receivedAtIso}`,
      `Name: ${input.lead.name}`,
      `Contact: ${input.lead.contact}`,
      "",
      input.lead.message,
    ].join("\n");

    try {
      const response = await this.#fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          chat_id: input.chatId,
          text,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        return { ok: false, reason: "telegram_upstream_error" };
      }

      const payload = (await response.json()) as TelegramApiResponse;

      if (payload.ok !== true) {
        return { ok: false, reason: "telegram_rejected" };
      }

      return { ok: true, mode: "telegram" };
    } catch {
      return { ok: false, reason: "telegram_network_error" };
    }
  }
}
