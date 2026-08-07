import { type ContactFormValues, type LeadChannel } from "@repo/core/schemas";

/**
 * Outbound lead notifications.
 *
 * Both adapters are wired end to end but stay dormant until their credentials
 * exist in the environment — so the contact form is fully functional in
 * development and starts delivering the moment the tokens are filled in.
 *
 *   Telegram  → TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *               (create a bot via @BotFather, then send it any message and read
 *                the chat id from https://api.telegram.org/bot<TOKEN>/getUpdates)
 *   WhatsApp  → WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN + WHATSAPP_RECIPIENT
 *               (Meta Cloud API; note the 24h session-window rule — outside it
 *                only approved message templates are delivered)
 */

const TELEGRAM_API = "https://api.telegram.org";
const WHATSAPP_API = "https://graph.facebook.com/v21.0";
const TIMEOUT_MS = 8_000;

export interface DeliveryReport {
  delivered: LeadChannel[];
  failed: LeadChannel[];
  configured: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Treats blank optional fields as absent so they never reach the message. */
function filled(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) return undefined;
  return trimmed;
}

/** Human-readable lead summary shared by every channel. */
export function formatLead(lead: ContactFormValues, meta: { at: Date; source: string }): string {
  const rows: Array<[string, string | undefined]> = [
    ["Имя", lead.name],
    ["Почта", lead.email],
    ["Телефон", filled(lead.phone)],
    ["Услуга", filled(lead.service)],
    ["Бюджет", filled(lead.budget)],
  ];

  const head = rows
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return [
    "🔔 Новая заявка с сайта",
    head,
    "",
    lead.message,
    "",
    `— ${meta.source}, ${meta.at.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} МСК`,
  ].join("\n");
}

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function sendTelegram(text: string): Promise<boolean | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  return postJson(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: `<b>Заявка с сайта</b>\n\n<pre>${escapeHtml(text)}</pre>`,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

async function sendWhatsApp(text: string): Promise<boolean | null> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const recipient = process.env.WHATSAPP_RECIPIENT;
  if (!phoneNumberId || !accessToken || !recipient) return null;

  return postJson(
    `${WHATSAPP_API}/${phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { preview_url: false, body: text },
    },
    { Authorization: `Bearer ${accessToken}` },
  );
}

/** Fans the lead out to every configured channel. Never throws. */
export async function deliverLead(text: string): Promise<DeliveryReport> {
  const results = await Promise.all([
    sendTelegram(text).then((ok) => ["telegram", ok] as const),
    sendWhatsApp(text).then((ok) => ["whatsapp", ok] as const),
  ]);

  const delivered: LeadChannel[] = [];
  const failed: LeadChannel[] = [];
  let configured = false;

  for (const [channel, ok] of results) {
    if (ok === null) continue;
    configured = true;
    if (ok) delivered.push(channel);
    else failed.push(channel);
  }

  return { delivered, failed, configured };
}
