import { site } from "@/content/site";

/**
 * Client-side messenger configuration.
 *
 * These are deep links, not integrations — they work with nothing more than a
 * username / phone number, so the buttons stay useful before the bot side is
 * wired up. `NEXT_PUBLIC_*` must be read as a literal member expression for
 * Next.js to inline it at build time.
 */
const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? "prihodko_eng";
const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? site.phoneHref.replace(/\D/g, "");

export const messengers = {
  telegram: {
    username: telegramUsername,
    handle: `@${telegramUsername}`,
    url: `https://t.me/${telegramUsername}`,
  },
  whatsapp: {
    phone: whatsappPhone,
    handle: site.phone,
    url: `https://wa.me/${whatsappPhone}`,
  },
} as const;

const defaultGreeting = `Здравствуйте! Пишу с сайта — хочу обсудить задачу.`;

/** Telegram deep link with the message box pre-filled. */
export function telegramLink(text: string = defaultGreeting): string {
  return `${messengers.telegram.url}?text=${encodeURIComponent(text)}`;
}

/** wa.me deep link with the message box pre-filled. */
export function whatsappLink(text: string = defaultGreeting): string {
  return `${messengers.whatsapp.url}?text=${encodeURIComponent(text)}`;
}

/** Turns a partially filled form into a ready-to-send messenger draft. */
export function draftFromForm(values: {
  name?: string;
  service?: string;
  budget?: string;
  message?: string;
}): string {
  const lines = [
    "Здравствуйте! Заявка с сайта.",
    values.name ? `Имя: ${values.name}` : null,
    values.service ? `Услуга: ${values.service}` : null,
    values.budget ? `Бюджет: ${values.budget}` : null,
    values.message ? `Задача: ${values.message}` : null,
  ].filter((line): line is string => Boolean(line));

  return lines.length > 1 ? lines.join("\n") : defaultGreeting;
}
